import { z } from 'zod';
import { Fragment, Interface, ZeroAddress, getAddress } from 'ethers';
import artifact from '../abi/OwnershipRegistry.json';
import { address } from './state';

const record = z.record(z.string(), z.unknown());
const unsigned = z.object({ submitted: z.literal(false), tx: z.object({ from: address, to: z.string().nullable().optional(), data: z.string().regex(/^0x[0-9a-fA-F]+$/), value: z.union([z.string(), z.number()]).transform(String).default('0') }) });
export type Unsigned = z.infer<typeof unsigned>['tx'];
const card = z.object({ exists: z.boolean(), allowedWallet: address, registered: z.boolean(), owner: address, nickname: z.string() });
export type Card = z.infer<typeof card>;
export interface RegistryApi {
  chainId(): Promise<number>;
  ensureLibrary(): Promise<void>;
  prepareDeploy(issuer: string): Promise<Unsigned>;
  prepareIssue(contract: string, issuer: string, id: string, wallet: string): Promise<Unsigned>;
  getCard(contract: string, id: string): Promise<Card>;
  checkRegistry(contract: string, issuer: string): Promise<void>;
  link(contract: string, block: number): Promise<void>;
}
export class MultiBaas implements RegistryApi {
  constructor(private config: { baseUrl: string; apiKey: string; label: string; version: string }) {}
  private async request(path: string, body?: unknown): Promise<unknown> {
    let response;
    try {
      response = await fetch(`${this.config.baseUrl}${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: `Bearer ${this.config.apiKey}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), redirect: 'error', signal: AbortSignal.timeout(10_000) });
    } catch { throw new Error('MultiBaas request failed'); }
    if (!response.ok) throw new Error(`MultiBaas HTTP ${response.status}`);
    let data: unknown;
    try { data = await response.json(); } catch { throw new Error('Invalid MultiBaas response'); }
    const parsed = z.object({ status: z.number(), result: z.unknown() }).safeParse(data);
    if (!parsed.success || parsed.data.status < 200 || parsed.data.status >= 300) throw new Error('Invalid MultiBaas response');
    return parsed.data.result;
  }
  async chainId() { return z.object({ chainID: z.coerce.number().int().positive().safe() }).parse(await this.request('/chains/ethereum/status')).chainID; }
  async ensureLibrary() {
    const list = z.array(z.object({ label: z.string(), version: z.string() }).passthrough()).parse(await this.request('/contracts'));
    const versions = list.some(item => item.label === this.config.label)
      ? z.object({ versions: z.array(z.string()) }).parse(await this.request(`/contracts/${encodeURIComponent(this.config.label)}/versions`)).versions
      : [];
    if (versions.includes(this.config.version)) {
      const existing = record.parse(await this.request(`/contracts/${encodeURIComponent(this.config.label)}/${encodeURIComponent(this.config.version)}`));
      const rawAbi = z.string().parse(existing.rawAbi);
      const bin = z.string().parse(existing.bin);
      const fragments = z.array(z.unknown()).parse(JSON.parse(rawAbi)).map(fragment => Fragment.from(z.object({ type: z.string() }).passthrough().parse(fragment)));
      if (new Interface(fragments).formatJson() !== new Interface(artifact.abi).formatJson() || bin.replace(/^0x/, '') !== artifact.bytecode.slice(2)) throw new Error('Existing Library ABI or bytecode differs');
      return;
    }
    await this.request(`/contracts/${encodeURIComponent(this.config.label)}`, { label: this.config.label, contractName: artifact.contractName, version: this.config.version, rawAbi: JSON.stringify(artifact.abi), bin: artifact.bytecode.slice(2) });
  }
  private method(contract: string, method: string, args: string[], from?: string) {
    return this.request(`/chains/ethereum/addresses/${contract}/contracts/${encodeURIComponent(this.config.label)}/methods/${method}`, { args, signAndSubmit: false, ...(from ? { from } : {}), formatInts: 'as_strings' });
  }
  async prepareDeploy(issuer: string) { return unsigned.parse(await this.request(`/contracts/${encodeURIComponent(this.config.label)}/${encodeURIComponent(this.config.version)}/deploy`, { args: [issuer], from: issuer, signAndSubmit: false })).tx; }
  async prepareIssue(contract: string, issuer: string, id: string, wallet: string) { return unsigned.parse(await this.method(contract, 'issue', [id, wallet], issuer)).tx; }
  async getCard(contract: string, id: string) {
    const output = record.parse(await this.method(contract, 'getCard', [id])).output;
    if (Array.isArray(output) && output.length !== 5) throw new Error('Invalid card tuple');
    const candidate = Array.isArray(output) ? { exists: output[0], allowedWallet: output[1], registered: output[2], owner: output[3], nickname: output[4] } : output;
    const result = card.parse(candidate);
    if ((!result.exists && (result.allowedWallet !== ZeroAddress || result.registered || result.nickname !== '')) || (result.exists && result.allowedWallet === ZeroAddress) || (!result.registered && result.nickname !== '') || (result.registered && (result.owner !== result.allowedWallet || Buffer.byteLength(result.nickname) < 1 || Buffer.byteLength(result.nickname) > 96)) || result.registered !== (result.owner !== ZeroAddress)) throw new Error('Inconsistent card state');
    return result;
  }
  async checkRegistry(contract: string, issuer: string) {
    const output = record.parse(await this.method(contract, 'issuer', [])).output;
    if (address.parse(Array.isArray(output) && output.length === 1 ? output[0] : output) !== getAddress(issuer)) throw new Error('Registry issuer mismatch');
    const version = record.parse(await this.method(contract, 'schemaVersion', [])).output;
    const schemaVersion = Array.isArray(version) && version.length === 1 ? version[0] : version;
    if (schemaVersion !== '1' && schemaVersion !== 1) throw new Error('Registry schema mismatch');
  }
  async link(contract: string, block: number) {
    const addresses = z.array(z.object({ address }).passthrough()).parse(await this.request('/chains/ethereum/addresses'));
    if (addresses.some(item => item.address === getAddress(contract))) {
      const details = z.object({ contracts: z.array(z.object({ label: z.string(), version: z.string() })) }).parse(await this.request(`/chains/ethereum/addresses/${contract}`));
      const linked = details.contracts.find(item => item.label === this.config.label);
      if (linked) {
        if (linked.version !== this.config.version) throw new Error('Linked contract version differs');
        const indexing = z.object({ startBlockNumber: z.number().int().nonnegative() }).parse(await this.request(`/chains/ethereum/addresses/${contract}/contracts/${encodeURIComponent(this.config.label)}/status`));
        if (indexing.startBlockNumber !== block) throw new Error('Event indexing start block differs');
        return;
      }
    }
    await this.request(`/chains/ethereum/addresses/${contract}/contracts`, { label: this.config.label, version: this.config.version, startingBlock: String(block) });
  }
}
