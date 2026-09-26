// SPDX-License-Identifier: MIT
import { createEnsResolver, EnsError, normalizeEnsName, type EnsResolution } from '../../../../contracts/cli/ens';
import { getAddress } from 'ethers';
import { EnsSearchCursor } from '../generated/validators.js';
import type { components } from '../generated/api';
import { ApiError, sameHex, type RegistrationGateway } from './domain';
import { getRegistrationTransaction } from './service';
import { createLiveGateway, type RegistrationLog } from './multibaas-gateway';

type Cursor = components['schemas']['EnsSearchCursor'];
type Page = components['schemas']['EnsCardsResponse']['data'];
export type SearchGateway = RegistrationGateway & {
  deploymentBlock: number;
  searchBlock(number?: number): Promise<{ number: number; hash: string }>;
  registrationLogs(address: string, from: number, to: number): Promise<RegistrationLog[]>;
};
const changed = () => new ApiError(409, 'SEARCH_RESTART_REQUIRED', 'Start a new search');
const unavailable = () => new ApiError(503, 'UPSTREAM_UNAVAILABLE', 'Cannot verify registration');
export function normalizeCardSearch(value: string): string {
  const trimmed = value.trim();
  if (/^0x/i.test(trimmed)) {
    try { return getAddress(trimmed); } catch { throw new ApiError(400, 'INVALID_INPUT', 'Invalid wallet address'); }
  }
  return normalizeEnsName(trimmed);
}
function decodeCursor(value: string): Cursor {
  try {
    if (value.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error();
    const result: unknown = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    if (!EnsSearchCursor(result)) throw new Error();
    return result;
  } catch { throw new ApiError(400, 'INVALID_INPUT', 'Invalid cursor'); }
}
export async function searchEnsCards(input: {
  name: string; cursor?: string;
  resolve: (name: string) => Promise<EnsResolution>;
  gateway: SearchGateway;
  now?: () => number;
}): Promise<Page> {
  const name = normalizeCardSearch(input.name);
  const direct = name.startsWith('0x');
  const saved = input.cursor === undefined ? undefined : decodeCursor(input.cursor);
  const resolved = direct ? { address: name } : await input.resolve(name);
  const { gateway } = input;
  if (saved && saved.name !== name) throw new ApiError(400, 'INVALID_INPUT', 'Cursor belongs to another name');
  if (saved && !sameHex(saved.address, resolved.address)) throw new ApiError(409, 'ENS_ADDRESS_CHANGED', 'ENS address changed');
  await gateway.checkConnection?.();
  const head = await gateway.searchBlock();
  if (saved && (saved.chainId !== gateway.registry.chainId || !sameHex(saved.contract, gateway.registry.contractAddress) || saved.snapshot > head.number || saved.block > saved.snapshot || saved.block < gateway.deploymentBlock)) throw changed();
  const snapshot = saved ? await gateway.searchBlock(saved.snapshot) : head;
  if (saved && !sameHex(saved.snapshotHash, snapshot.hash)) throw changed();
  let block = saved?.block ?? snapshot.number;
  let index = saved?.index ?? Number.MAX_SAFE_INTEGER;
  const cards: Page['cards'] = [];
  const seen = new Set<string>();
  const now = input.now ?? Date.now;
  const deadline = now() + 18000;
  let ranges = 0;
  while (block >= gateway.deploymentBlock && cards.length < 20 && ranges < 4 && now() < deadline) {
    const end = block;
    const from = Math.max(gateway.deploymentBlock, end - 1999);
    const logs = (await gateway.registrationLogs(resolved.address, from, end))
      .filter(log => log.blockNumber < end || log.logIndex <= index)
      .sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex);
    let stopped = false;
    for (const log of logs) {
      if (cards.length === 20 || now() >= deadline) { stopped = true; break; }
      if (log.blockNumber < from || log.blockNumber > end || !sameHex(log.owner, resolved.address)) throw unavailable();
      if (!seen.has(log.cardId)) {
        const verified = await getRegistrationTransaction({ gateway, cardId: log.cardId, txHash: log.transactionHash });
        if (verified.status !== 'confirmed' || verified.blockNumber !== log.blockNumber || !sameHex(verified.owner.address, resolved.address) || verified.owner.nickname !== log.nickname) throw unavailable();
        if (!sameHex((await gateway.searchBlock(log.blockNumber)).hash, log.blockHash)) throw changed();
        cards.push({ cardId: log.cardId, owner: verified.owner, transactionHash: verified.transactionHash, blockNumber: verified.blockNumber });
        seen.add(log.cardId);
      }
      block = log.logIndex === 0 ? log.blockNumber - 1 : log.blockNumber;
      index = log.logIndex === 0 ? Number.MAX_SAFE_INTEGER : log.logIndex - 1;
    }
    if (stopped) break;
    block = from - 1; index = Number.MAX_SAFE_INTEGER; ranges++;
  }
  if (!sameHex((await gateway.searchBlock(snapshot.number)).hash, snapshot.hash)) throw changed();
  const complete = block < gateway.deploymentBlock;
  const next: Cursor = { version: 1, name, address: resolved.address, chainId: gateway.registry.chainId,
    contract: gateway.registry.contractAddress, snapshot: snapshot.number, snapshotHash: snapshot.hash,
    block: Math.max(0, block), index };
  return { name, address: resolved.address, ensChainId: direct ? null : 11155111, registry: gateway.registry, snapshot, cards,
    complete, nextCursor: complete ? null : Buffer.from(JSON.stringify(next)).toString('base64url') };
}
export async function liveEnsSearch(name: string, cursor?: string): Promise<Page> {
  const query = normalizeCardSearch(name);
  const resolver = query.startsWith('0x') ? null : createEnsResolver(process.env.ENS_SEPOLIA_RPC_URL);
  try { return await searchEnsCards({ name: query, cursor, resolve: value => {
    if (!resolver) throw new Error('Address search must not resolve ENS');
    return resolver.resolve(value);
  }, gateway: createLiveGateway(process.env) }); }
  finally { resolver?.destroy(); }
}
export function ensApiError(error: unknown): ApiError {
  if (!(error instanceof EnsError)) return error instanceof ApiError ? error : unavailable();
  return new ApiError(error.code === 'ENS_INVALID_NAME' ? 400 : error.code === 'ENS_NOT_FOUND' ? 404 : error.code === 'ENS_ADDRESS_CHANGED' ? 409 : 503, error.code, error.message);
}
