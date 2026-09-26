// SPDX-License-Identifier: MIT
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, rm, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import hre from 'hardhat';
import { BrowserProvider, Contract, ContractFactory, Interface, Wallet, ZeroAddress, keccak256 } from 'ethers';
import artifact from '../abi/OwnershipRegistry.json';
import { execute, resume, Context } from '../cli/issuer';
import { loadState, withStateLock } from '../cli/state';
import { RegistryApi } from '../cli/multibaas';

let keepAlive: NodeJS.Timeout;
before(() => { keepAlive = setInterval(() => {}, 1000); });
after(() => { clearInterval(keepAlive); });
const abi = new Interface(artifact.abi);
async function setup() {
  await hre.network.provider.send('hardhat_reset');
  const provider = new BrowserProvider(hre.network.provider, undefined, { cacheTimeout: -1 });
  const wallet = Wallet.createRandom();
  await hre.network.provider.send('hardhat_setBalance', [wallet.address, '0x56BC75E2D63100000']);
  const owner = await (await provider.getSigner(1)).getAddress();
  let links = 0, failLink = false, mismatch = false;
  const api: RegistryApi = {
    async chainId() { return 31337; }, async ensureLibrary() {},
    async prepareDeploy(issuer) { return { from: issuer, to: null, data: artifact.bytecode + abi.encodeDeploy([issuer]).slice(2), value: '0' }; },
    async prepareIssue(contract, issuer, id, allowed) { return { from: issuer, to: contract, data: abi.encodeFunctionData('issue', [id, mismatch ? ZeroAddress : allowed]), value: '0' }; },
    async getCard(contract, id) {
      const data = await new Contract(contract, abi, provider).getFunction('getCard')(id);
      return { exists: Boolean(data.exists), allowedWallet: String(data.allowedWallet), registered: Boolean(data.registered), owner: String(data.owner), nickname: String(data.nickname) };
    },
    async checkRegistry(contract, issuer) { assert.equal(await new Contract(contract, abi, provider).getFunction('issuer')(), issuer); },
    async link(_contract, block) { links++; assert.equal(block, 1); if (failLink) throw new Error('link failed'); },
  };
  const context: Context = { provider, api, chainId: 31337, issuer: wallet.address, label: 'registry', version: '1', publicApiOrigin: 'https://example.test' };
  const directory = await mkdtemp(join(tmpdir(), 'issuer-test-'));
  return { context, wallet, owner, directory, file: join(directory, 'state.json'), links: () => links, setFailLink: (value: boolean) => { failLink = value; }, setMismatch: () => { mismatch = true; } };
}
test('deployment saves before broadcast, resumes failed link using original receipt', async () => {
  const s = await setup();
  try {
    s.setFailLink(true);
    await assert.rejects(() => execute(s.context, { kind: 'deploy', bytecodeHash: keccak256(artifact.bytecode) }, s.file, s.wallet), /link failed/);
    const saved = await loadState(s.file);
    assert.ok(saved);
    assert.equal((await stat(s.file)).mode & 0o777, 0o600);
    assert.equal((await readFile(s.file, 'utf8')).includes(s.wallet.privateKey.slice(2)), false);
    assert.equal(await s.context.provider.getTransactionCount(s.wallet.address), 1);
    s.setFailLink(false);
    const result = await resume(s.context, s.file);
    assert.equal(result.status, 'complete');
    assert.ok(result.contract);
    assert.equal(s.links(), 2);
    assert.equal(await s.context.provider.getTransactionCount(s.wallet.address), 1);
    await chmod(s.file, 0o644);
    await assert.rejects(() => loadState(s.file), /0600/);
  } finally { await rm(s.directory, { recursive: true }); }
});
test('issue retries existing card without nonce, rejects changed wallet and calldata', async () => {
  const s = await setup();
  try {
    const deployment = await execute(s.context, { kind: 'deploy', bytecodeHash: keccak256(artifact.bytecode) }, s.file, s.wallet);
    assert.ok(deployment.contract);
    const operation = { kind: 'issue' as const, contract: deployment.contract, cardId: 'sample', wallet: s.owner };
    const file = join(s.directory, 'issue.json');
    assert.equal((await execute(s.context, operation, file, s.wallet)).status, 'complete');
    assert.equal((await execute(s.context, operation, join(s.directory, 'retry.json'), s.wallet)).status, 'already-issued');
    assert.equal(await s.context.provider.getTransactionCount(s.wallet.address), 2);
    await assert.rejects(() => execute(s.context, { ...operation, wallet: s.wallet.address }, join(s.directory, 'different.json'), s.wallet), /another wallet/);
    await assert.rejects(() => execute(s.context, { ...operation, cardId: 'other' }, file, s.wallet), /another operation/);
    s.setMismatch();
    await assert.rejects(() => execute(s.context, { ...operation, cardId: 'other' }, join(s.directory, 'bad.json'), s.wallet), /Unsigned transaction mismatch/);
    assert.equal(await s.context.provider.getTransactionCount(s.wallet.address), 2);
  } finally { await rm(s.directory, { recursive: true }); }
});
test('unknown broadcast outcome persists signed transaction, explicit replay uses same hash', async () => {
  const s = await setup();
  try {
    const original = s.context.provider.broadcastTransaction.bind(s.context.provider);
    s.context.provider.broadcastTransaction = async () => { assert.ok(await loadState(s.file)); throw new Error('network unavailable'); };
    await assert.rejects(() => execute(s.context, { kind: 'deploy', bytecodeHash: keccak256(artifact.bytecode) }, s.file, s.wallet), /network unavailable/);
    const saved = await loadState(s.file);
    assert.ok(saved);
    assert.equal((await resume(s.context, s.file)).status, 'not-seen');
    s.context.provider.broadcastTransaction = original;
    const replay = await resume(s.context, s.file, true);
    assert.equal(replay.transactionHash, saved.transactionHash);
    assert.equal((await resume(s.context, s.file)).status, 'complete');
    assert.equal(await s.context.provider.getTransactionCount(s.wallet.address), 1);
  } finally { await rm(s.directory, { recursive: true }); }
});
test('same state lock rejects concurrent writer and releases after failure', async () => {
  const s = await setup();
  try {
    await withStateLock(s.file, async () => { await assert.rejects(() => withStateLock(s.file, async () => {}), /locked/); });
    await assert.rejects(() => withStateLock(s.file, async () => { throw new Error('stop'); }), /stop/);
    await withStateLock(s.file, async () => {});
  } finally { await rm(s.directory, { recursive: true }); }
});
test('resume rejects wrong chain, consumed nonce and network failure without broadcast', async () => {
  const s = await setup();
  try {
    const broadcast = s.context.provider.broadcastTransaction.bind(s.context.provider);
    s.context.provider.broadcastTransaction = async () => { throw new Error('offline'); };
    await assert.rejects(() => execute(s.context, { kind: 'deploy', bytecodeHash: keccak256(artifact.bytecode) }, s.file, s.wallet), /offline/);
    await assert.rejects(() => resume({ ...s.context, chainId: 1 }, s.file, true), /Chain mismatch/);
    const originalReceipt = s.context.provider.getTransactionReceipt.bind(s.context.provider);
    s.context.provider.getTransactionReceipt = async () => { throw new Error('read failed'); };
    await assert.rejects(() => resume(s.context, s.file, true), /read failed/);
    s.context.provider.getTransactionReceipt = originalReceipt;
    s.context.provider.broadcastTransaction = broadcast;
    const replacement = await s.wallet.signTransaction({ chainId: 31337, nonce: 0, to: s.owner, value: 0n, gasLimit: 21000, gasPrice: 2000000000 });
    await s.context.provider.broadcastTransaction(replacement);
    await assert.rejects(() => resume(s.context, s.file, true), /Nonce has been consumed/);
    assert.equal(await s.context.provider.getTransactionCount(s.wallet.address), 1);
  } finally { await rm(s.directory, { recursive: true }); }
});
test('ENS recipient is frozen before signing and resume does not resolve it again', async () => {
  const s = await setup();
  try {
    const deployment = await execute(s.context, {kind:'deploy',bytecodeHash:keccak256(artifact.bytecode)},s.file,s.wallet);
    assert.ok(deployment.contract);
    const operation = {kind:'issue' as const,contract:deployment.contract,cardId:'ens-card',wallet:s.owner};
    const file=join(s.directory,'ens.json');
    const recipient={name:'shomeikun.eth',address:s.owner,chainId:11155111 as const};
    await assert.rejects(execute(s.context,operation,file,s.wallet,{recipient,recheck:async()=>{throw new Error('ENS_ADDRESS_CHANGED');}}),/ENS_ADDRESS_CHANGED/);
    assert.equal(await s.context.provider.getTransactionCount(s.wallet.address),1);
    let checked=0;
    const result=await execute(s.context,operation,file,s.wallet,{recipient,recheck:async()=>{checked++;}});
    assert.equal(result.status,'complete');assert.equal(checked,1);
    assert.deepEqual((await loadState(file))?.ensRecipient,recipient);
    assert.equal((await resume(s.context,file)).status,'complete');
    assert.equal(await s.context.provider.getTransactionCount(s.wallet.address),2);
  } finally {await rm(s.directory,{recursive:true});}
});
