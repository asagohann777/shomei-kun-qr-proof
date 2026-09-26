// SPDX-License-Identifier: MIT
import { AbstractProvider, Interface, Signer, Transaction, TransactionRequest, ZeroAddress, getAddress, getCreateAddress, keccak256 } from 'ethers';
import artifact from '../abi/OwnershipRegistry.json';
import { Operation, State, loadState, saveState, withStateLock } from './state';
import type { EnsResolution } from './ens';
import { RegistryApi } from './multibaas';

const abi = new Interface(artifact.abi);
export type Context = { provider: AbstractProvider; api: RegistryApi; chainId: number; issuer: string; label: string; version: string; publicApiOrigin: string };
export type Result = { status: 'pending' | 'not-seen' | 'complete' | 'already-issued'; transactionHash?: string; contract?: string; cardUrl?: string };

function expectedTransaction(operation: Operation, issuer: string): { to: string | null; data: string } {
  return operation.kind === 'deploy'
    ? { to: null, data: artifact.bytecode + abi.encodeDeploy([issuer]).slice(2) }
    : { to: operation.contract, data: abi.encodeFunctionData('issue', [operation.cardId, operation.wallet]) };
}
async function verifyNetwork(context: Context) {
  const [network, chainId] = await Promise.all([context.provider.getNetwork(), context.api.chainId()]);
  if (network.chainId !== BigInt(context.chainId) || chainId !== context.chainId) throw new Error('Chain mismatch');
}
function verifyState(state: State, context: Context) {
  if (state.chainId !== context.chainId || state.issuer !== getAddress(context.issuer) || state.label !== context.label || state.contractVersion !== context.version) throw new Error('State configuration mismatch');
  if (state.operation.kind === 'deploy' && state.operation.bytecodeHash !== keccak256(artifact.bytecode)) throw new Error('State bytecode differs');
  const expected = expectedTransaction(state.operation, context.issuer);
  const tx = Transaction.from(state.rawTransaction);
  if (tx.from !== getAddress(context.issuer) || tx.chainId !== BigInt(context.chainId) || tx.nonce !== state.nonce || keccak256(state.rawTransaction) !== state.transactionHash) throw new Error('Signed transaction identity mismatch');
  if (tx.to !== expected.to || tx.data.toLowerCase() !== expected.data.toLowerCase() || tx.value !== 0n) throw new Error('State operation mismatch');
}
function cardUrl(context: Context, id: string) { return `${context.publicApiOrigin}/api/v1/cards/${encodeURIComponent(id)}`; }

async function finish(context: Context, state: State, rebroadcast: boolean): Promise<Result> {
  verifyState(state, context);
  const receipt = await context.provider.getTransactionReceipt(state.transactionHash);
  if (!receipt) {
    const transaction = await context.provider.getTransaction(state.transactionHash);
    if (transaction) return { status: 'pending', transactionHash: state.transactionHash };
    const nonce = await context.provider.getTransactionCount(state.issuer, 'pending');
    if (nonce > state.nonce) throw new Error('Nonce has been consumed. Inspect the account before continuing.');
    if (rebroadcast) await context.provider.broadcastTransaction(state.rawTransaction);
    return { status: rebroadcast ? 'pending' : 'not-seen', transactionHash: state.transactionHash };
  }
  const expected = expectedTransaction(state.operation, context.issuer);
  if (receipt.hash !== state.transactionHash || getAddress(receipt.from) !== state.issuer || receipt.to !== expected.to) throw new Error('Receipt transaction mismatch');
  if (receipt.status !== 1) throw new Error('Transaction reverted');
  const block = await context.provider.getBlock(receipt.blockNumber);
  if (block?.hash !== receipt.blockHash) throw new Error('Receipt block mismatch');
  const operation = state.operation;
  if (operation.kind === 'deploy') {
    const contract = receipt.contractAddress;
    if (!contract || contract !== getCreateAddress({ from: state.issuer, nonce: state.nonce }) || await context.provider.getCode(contract) === '0x') throw new Error('Deployment receipt has no contract');
    await context.api.link(contract, receipt.blockNumber);
    await context.api.checkRegistry(contract, state.issuer);
    return { status: 'complete', transactionHash: state.transactionHash, contract };
  }
  const card = await context.api.getCard(operation.contract, operation.cardId);
  const eventMatches = receipt.logs.some(log => {
    if (getAddress(log.address) !== operation.contract) return false;
    try {
      const event = abi.parseLog(log);
      return event?.name === 'CardIssued' && event.args.cardId === operation.cardId && event.args.allowedWallet === operation.wallet && event.args.cardKey === keccak256(Buffer.from(operation.cardId));
    } catch { return false; }
  });
  if (!card.exists || card.allowedWallet !== operation.wallet || !eventMatches) throw new Error('Issued card does not match receipt');
  return { status: 'complete', transactionHash: state.transactionHash, contract: operation.contract, cardUrl: cardUrl(context, operation.cardId) };
}

export async function resume(context: Context, file: string, rebroadcast = false): Promise<Result> {
  return withStateLock(file, async () => {
    const state = await loadState(file);
    if (!state) throw new Error('State file does not exist');
    await verifyNetwork(context);
    return finish(context, state, rebroadcast);
  });
}

export async function execute(context: Context, operation: Operation, file: string, signer: Signer, ens?: { recipient: EnsResolution; recheck: () => Promise<void> }): Promise<Result> {
  return withStateLock(file, async () => {
    await verifyNetwork(context);
    const previous = await loadState(file);
    if (previous) {
      if (JSON.stringify(previous.operation) !== JSON.stringify(operation)) throw new Error('State already belongs to another operation');
      return finish(context, previous, false);
    }
    if (getAddress(await signer.getAddress()) !== getAddress(context.issuer)) throw new Error('Signer is not the configured issuer');
    if (operation.kind === 'issue') {
      await context.api.checkRegistry(operation.contract, context.issuer);
      const card = await context.api.getCard(operation.contract, operation.cardId);
      if (card.exists) {
        if (card.allowedWallet !== operation.wallet) throw new Error('Card already issued to another wallet');
        return { status: 'already-issued', contract: operation.contract, cardUrl: cardUrl(context, operation.cardId) };
      }
    } else await context.api.ensureLibrary();
    const unsigned = operation.kind === 'deploy'
      ? await context.api.prepareDeploy(context.issuer)
      : await context.api.prepareIssue(operation.contract, context.issuer, operation.cardId, operation.wallet);
    const expected = expectedTransaction(operation, context.issuer);
    const to = unsigned.to && unsigned.to !== ZeroAddress ? getAddress(unsigned.to) : null;
    if (getAddress(unsigned.from) !== getAddress(context.issuer) || to !== expected.to || unsigned.data.toLowerCase() !== expected.data.toLowerCase() || BigInt(unsigned.value) !== 0n) throw new Error('Unsigned transaction mismatch');
    const [nonce, fees, block] = await Promise.all([context.provider.getTransactionCount(context.issuer, 'pending'), context.provider.getFeeData(), context.provider.getBlock('latest')]);
    const request: TransactionRequest = { from: context.issuer, to, data: expected.data, value: 0n, chainId: context.chainId, nonce };
    request.gasLimit = await context.provider.estimateGas(request);
    if (block?.baseFeePerGas != null) {
      if (fees.maxFeePerGas == null || fees.maxPriorityFeePerGas == null) throw new Error('Missing EIP-1559 fee data');
      Object.assign(request, { type: 2, maxFeePerGas: fees.maxFeePerGas, maxPriorityFeePerGas: fees.maxPriorityFeePerGas });
    } else {
      if (fees.gasPrice == null) throw new Error('Missing gas price');
      Object.assign(request, { type: 0, gasPrice: fees.gasPrice });
    }
    if (ens) {
      if (operation.kind !== 'issue' || getAddress(operation.wallet) !== getAddress(ens.recipient.address)) throw new Error('ENS recipient mismatch');
      await ens.recheck();
    }
    const rawTransaction = await signer.signTransaction(request);
    const state: State = { version: 1, chainId: context.chainId, issuer: getAddress(context.issuer), label: context.label, contractVersion: context.version, operation, nonce, rawTransaction, transactionHash: keccak256(rawTransaction), ...(ens ? { ensRecipient: ens.recipient } : {}) };
    verifyState(state, context);
    await saveState(file, state);
    await context.provider.broadcastTransaction(rawTransaction);
    return finish(context, state, false);
  });
}
