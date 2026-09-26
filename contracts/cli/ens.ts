// SPDX-License-Identifier: MIT
import { FetchRequest, JsonRpcProvider, ZeroAddress, ensNormalize, getAddress } from 'ethers';

export class EnsError extends Error {
  constructor(readonly code: 'ENS_INVALID_NAME' | 'ENS_NOT_CONFIGURED' | 'ENS_NOT_FOUND' | 'ENS_UNAVAILABLE' | 'ENS_ADDRESS_CHANGED') { super(code); }
}
export function normalizeEnsName(value: string): string {
  try {
    if (value.length > 255 || !value.includes('.') || value.trim() !== value) throw new Error();
    return ensNormalize(value);
  } catch { throw new EnsError('ENS_INVALID_NAME'); }
}
function publicHttps(value: string): URL {
  const url = new URL(value);
  const h = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.hash ||
      !h.includes('.') || h.endsWith('.local') || h.endsWith('.localhost') || h.endsWith('.internal') ||
      h.startsWith('[') || /^[\d.]+$/.test(h)) throw new EnsError('ENS_UNAVAILABLE');
  return url;
}
class EnsProvider extends JsonRpcProvider {
  override async ccipReadFetch(...[tx, calldata, urls]: Parameters<JsonRpcProvider['ccipReadFetch']>): Promise<string | null> {
    if (!tx.to || this.disableCcipRead) return null;
    for (const template of urls.slice(0, 3)) {
      const url = publicHttps(template.replaceAll('{sender}', tx.to.toLowerCase()).replaceAll('{data}', calldata.toLowerCase()));
      const response = await fetch(url, {
        method: template.includes('{data}') ? 'GET' : 'POST', redirect: 'manual',
        headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(4000),
        ...(!template.includes('{data}') ? { body: JSON.stringify({ sender: tx.to.toLowerCase(), data: calldata.toLowerCase() }) } : {}),
      });
      if (response.status >= 300 && response.status < 400) throw new EnsError('ENS_UNAVAILABLE');
      if (response.status >= 500) continue;
      if (!response.ok) throw new EnsError('ENS_UNAVAILABLE');
      const result: unknown = await response.json();
      if (result && typeof result === 'object' && 'data' in result && typeof result.data === 'string' && /^0x(?:[\da-f]{2})*$/i.test(result.data)) return result.data;
      throw new EnsError('ENS_UNAVAILABLE');
    }
    throw new EnsError('ENS_UNAVAILABLE');
  }
}
export type EnsResolution = { name: string; address: string; chainId: 11155111 };
export function createEnsResolver(rpcUrl: string | undefined) {
  if (!rpcUrl) throw new EnsError('ENS_NOT_CONFIGURED');
  let provider: EnsProvider;
  try {
    const request = new FetchRequest(publicHttps(rpcUrl).href);
    request.timeout = 6000;
    request.getUrlFunc = async req => {
      const response = await fetch(publicHttps(req.url), {
        method: req.method, headers: req.headers, redirect: 'manual',
        body: req.body ? new Uint8Array(req.body) : undefined, signal: AbortSignal.timeout(6000),
      });
      if (response.status >= 300 && response.status < 400) throw new EnsError('ENS_UNAVAILABLE');
      return { statusCode: response.status, statusMessage: response.statusText, headers: Object.fromEntries(response.headers), body: new Uint8Array(await response.arrayBuffer()) };
    };
    provider = new EnsProvider(request, undefined, { batchMaxCount: 1, cacheTimeout: -1 });
  } catch { throw new EnsError('ENS_UNAVAILABLE'); }
  return {
    async resolve(value: string): Promise<EnsResolution> {
      const name = normalizeEnsName(value);
      try {
        if ((await provider.getNetwork()).chainId !== 11155111n) throw new EnsError('ENS_UNAVAILABLE');
        const resolved = await provider.resolveName(name);
        if (!resolved || resolved === ZeroAddress) throw new EnsError('ENS_NOT_FOUND');
        return { name, address: getAddress(resolved), chainId: 11155111 };
      } catch (error) {
        if (error instanceof EnsError) throw error;
        throw new EnsError('ENS_UNAVAILABLE');
      }
    },
    async primaryName(address: string): Promise<string | null> {
      if ((await provider.getNetwork()).chainId !== 11155111n) throw new EnsError('ENS_UNAVAILABLE');
      return verifiedPrimaryName(address, value => provider.lookupAddress(value), name => provider.resolveName(name));
    },
    async requireEoa(address: string) {
      if (await provider.getCode(address) !== '0x') throw new EnsError('ENS_UNAVAILABLE');
    },
    destroy() { provider.destroy(); },
  };
}
export async function confirmEnsRecipient(input: {
  name: string;
  resolve: (name: string) => Promise<EnsResolution>;
  requireEoa: (address: string) => Promise<void>;
  confirm: (result: EnsResolution) => Promise<boolean>;
}): Promise<EnsResolution> {
  const first = await input.resolve(normalizeEnsName(input.name));
  await input.requireEoa(first.address);
  if (!await input.confirm(first)) throw new Error('ENS recipient not confirmed');
  return first;
}
export async function recheckEnsRecipient(first: EnsResolution, resolve: (name: string) => Promise<EnsResolution>): Promise<void> {
  const current = await resolve(first.name);
  if (getAddress(current.address) !== getAddress(first.address)) throw new EnsError('ENS_ADDRESS_CHANGED');
}

export async function verifiedPrimaryName(address: string, reverse: (address: string) => Promise<string | null>, forward: (name: string) => Promise<string | null>): Promise<string | null> {
  try {
    const wallet = getAddress(address);
    const candidate = await reverse(wallet);
    if (!candidate) return null;
    const name = normalizeEnsName(candidate);
    const resolved = await forward(name);
    return resolved && getAddress(resolved) === wallet ? name : null;
  } catch { return null; }
}
