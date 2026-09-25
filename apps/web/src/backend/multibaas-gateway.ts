import { Fragment, Interface, id } from "ethers";
import registryArtifact from "../../../../contracts/abi/OwnershipRegistry.json";
import { ApiError, sameHex, type Connection, type CardRecord, type ChainTransaction, type RegistrationEvent, type RegistrationGateway, type TransactionReceipt, type UnsignedTransaction } from "./domain";
import { parseLiveConfig, type LiveConfig } from "./live-config";

export const registryInterface = new Interface(registryArtifact.abi);
const eventSignature = "CardRegistered(bytes32,string,address,string)";
const zeroAddress = `0x${"0".repeat(40)}`;
const unavailable = () => new ApiError(503, "UPSTREAM_UNAVAILABLE", "Upstream response is unavailable or invalid");
const mismatch = () => new ApiError(503, "CONNECTION_MISMATCH", "Connection does not match configuration");
function object(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw unavailable();
  return Object.fromEntries(Object.entries(value));
}
function string(value: unknown): string { if (typeof value !== "string") throw unavailable(); return value; }
function bool(value: unknown): boolean { if (typeof value !== "boolean") throw unavailable(); return value; }
function hex(value: unknown, bytes?: number): string {
  const result = string(value);
  if (!/^0x(?:[0-9a-fA-F]{2})*$/.test(result) || (bytes !== undefined && result.length !== 2 + bytes * 2)) throw unavailable();
  return result.toLowerCase();
}
function decimal(value: unknown): number {
  if (typeof value !== "number" && (typeof value !== "string" || !/^(0|[1-9][0-9]*)$/.test(value))) throw unavailable();
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 0) throw unavailable();
  return result;
}
function quantity(value: unknown): number {
  const raw = string(value);
  if (!/^0x[0-9a-fA-F]+$/.test(raw)) throw unavailable();
  const number = Number(BigInt(raw));
  if (!Number.isSafeInteger(number)) throw unavailable();
  return number;
}
function scalar(value: unknown): unknown {
  if (Array.isArray(value)) { if (value.length !== 1) throw unavailable(); return value[0]; }
  return value;
}
function registration(data: string): { cardId: string; nickname: string } | undefined {
  try {
    const decoded = registryInterface.parseTransaction({ data });
    if (decoded?.name !== "register") return undefined;
    return { cardId: string(decoded.args[0]), nickname: string(decoded.args[1]) };
  } catch { return undefined; }
}

export class MultiBaasGateway implements RegistrationGateway {
  readonly mode = "live";
  readonly registry;
  private readonly deadline: number;
  private connection: ReturnType<MultiBaasGateway["verifyConnection"]> | undefined;
  constructor(private readonly config: LiveConfig, private readonly fetcher: typeof fetch = fetch) {
    this.registry = { chainId: config.chainId, contractAddress: config.address, issuer: config.issuer };
    this.deadline = Date.now() + 30_000;
  }
  private async request(url: string, init: RequestInit): Promise<unknown> {
    const remaining = this.deadline - Date.now();
    if (remaining <= 0) throw new ApiError(503, "UPSTREAM_TIMEOUT", "Upstream request timed out");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.min(10_000, remaining));
    try {
      const response = await this.fetcher(url, { ...init, redirect: "manual", signal: controller.signal });
      if (response.status === 401 || response.status === 403) throw new ApiError(503, "MULTIBAAS_AUTH_FAILED", "Upstream authentication failed");
      if (!response.ok) {
        console.error("upstream_http_error", { service: url.startsWith(this.config.baseUrl + "/") ? "multibaas" : "rpc", status: response.status });
        throw unavailable();
      }
      return await response.json();
    } catch (error) {
      if (controller.signal.aborted) throw new ApiError(503, "UPSTREAM_TIMEOUT", "Upstream request timed out");
      if (error instanceof ApiError) throw error;
      console.error("upstream_request_error", { service: url.startsWith(this.config.baseUrl + "/") ? "multibaas" : "rpc", kind: error instanceof Error ? error.name : "unknown" });
      throw unavailable();
    } finally { clearTimeout(timeout); }
  }
  private async api(path: string, body?: unknown): Promise<unknown> {
    const wrapper = object(await this.request(`${this.config.baseUrl}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { Authorization: `Bearer ${this.config.apiKey}`, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }));
    if (wrapper.status !== 200 || typeof wrapper.message !== "string" || !("result" in wrapper)) throw unavailable();
    return wrapper.result;
  }
  private async rpc(method: string, params: unknown[]): Promise<unknown> {
    const response = object(await this.request(this.config.publicRpcUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    }));
    if (response.jsonrpc !== "2.0" || response.id !== 1 || "error" in response || !("result" in response)) throw unavailable();
    return response.result;
  }
  private method(name: string, args: unknown[], from?: string): Promise<unknown> {
    return this.api(`/chains/ethereum/addresses/${this.config.address}/contracts/${this.config.label}/methods/${name}`, {
      args, signAndSubmit: false, formatInts: "as_strings", ...(from ? { from } : {}),
    });
  }
  private async verifyConnection(): Promise<Connection> {
    const status = object(await this.api("/chains/ethereum/status"));
    if (decimal(status.chainID) !== this.config.chainId || quantity(await this.rpc("eth_chainId", [])) !== this.config.chainId) throw mismatch();
    if (hex(await this.rpc("eth_getCode", [this.config.address, "latest"])) === "0x") throw mismatch();
    const linked = object(await this.api(`/chains/ethereum/addresses/${this.config.address}`));
    if (!sameHex(hex(linked.address, 20), this.config.address) || !Array.isArray(linked.contracts)) throw mismatch();
    if (!linked.contracts.some((entry: unknown) => { const c = object(entry); return c.label === this.config.label && c.version === this.config.version; })) throw mismatch();
    const library = object(await this.api(`/contracts/${this.config.label}/${this.config.version}`));
    if (library.label !== this.config.label || library.version !== this.config.version) throw mismatch();
    try {
      const abi: unknown = JSON.parse(string(library.rawAbi));
      if (!Array.isArray(abi)) throw mismatch();
      const actual = new Interface(abi.map((entry: unknown) => Fragment.from(object(entry))));
      for (const expected of registryInterface.fragments) {
        const signature = expected.format("full");
        if (!actual.fragments.some((item) => item.format("full") === signature)) throw mismatch();
      }
    } catch { throw mismatch(); }
    const issuer = scalar(object(await this.method("issuer", [])).output);
    const schema = scalar(object(await this.method("schemaVersion", [])).output);
    if (!sameHex(hex(issuer, 20), this.config.issuer) || decimal(schema) !== 1) throw mismatch();
    const block = object(await this.api("/chains/ethereum/blocks/latest"));
    return {
      status: "ready" as const,
      network: { name: "Curvegrid Testnet", chainId: this.config.chainId, nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: [this.config.publicRpcUrl] },
      registry: this.registry, latestBlock: { number: decimal(block.number), hash: hex(block.hash, 32) }, nicknameMaxUtf8Bytes: 96,
    };
  }
  checkConnection() { return this.connection ??= this.verifyConnection(); }
  async readCard(cardId: string): Promise<CardRecord | null> {
    await this.checkConnection();
    const output: unknown = object(await this.method("getCard", [cardId])).output;
    const names = ["exists", "allowedWallet", "registered", "owner", "nickname"];
    let values: unknown[];
    if (Array.isArray(output)) { if (output.length !== 5) throw unavailable(); values = output; }
    else { const record = object(output); if (Object.keys(record).length !== 5) throw unavailable(); values = names.map((name) => record[name]); }
    const exists = bool(values[0]); const allowedWallet = hex(values[1], 20); const registered = bool(values[2]); const owner = hex(values[3], 20); const nickname = string(values[4]);
    if (!exists) {
      if (allowedWallet !== zeroAddress || registered || owner !== zeroAddress || nickname !== "") throw unavailable();
      return null;
    }
    if (allowedWallet === zeroAddress || registered !== (owner !== zeroAddress)) throw unavailable();
    const common = { cardId, playerName: "証明一郎", allowedWallet };
    if (!registered) { if (nickname !== "") throw unavailable(); return { ...common, kind: "unregistered" }; }
    if (!nickname.isWellFormed() || owner !== allowedWallet || new TextEncoder().encode(nickname).length < 1 || new TextEncoder().encode(nickname).length > 96) throw unavailable();
    return { ...common, kind: "registered", owner: { address: owner, nickname } };
  }
  async buildRegistrationTransaction(input: {cardId: string; walletAddress: string; nickname: string}): Promise<UnsignedTransaction> {
    await this.checkConnection();
    const result = object(await this.method("register", [input.cardId, input.nickname], input.walletAddress));
    if (result.submitted !== false) throw unavailable();
    const tx = object(result.tx); const from = hex(tx.from, 20); const to = hex(tx.to, 20); const data = hex(tx.data);
    const decoded = registration(data);
    if (tx.value !== "0" || !sameHex(from, input.walletAddress) || to !== this.config.address || decoded?.cardId !== input.cardId || decoded.nickname !== input.nickname || (tx.chainId !== undefined && decimal(tx.chainId) !== this.config.chainId)) throw unavailable();
    return { chainId: this.config.chainId, from, to, data, value: "0" };
  }
  async getTransaction(txHash: string): Promise<ChainTransaction | null> {
    await this.checkConnection();
    const result = object(await this.api(`/chains/ethereum/transactions/${txHash}`));
    const data = object(result.data);
    const hash = hex(data.hash, 32); const from = hex(result.from, 20); const to = hex(data.to, 20);
    if (data.from !== undefined && !sameHex(hex(data.from, 20), from)) throw unavailable();
    return { hash, from, to, chainId: data.chainId === undefined || data.chainId === null ? this.config.chainId : quantity(data.chainId), pending: bool(result.isPending), registration: quantity(data.value) === 0 ? registration(hex(data.input)) : undefined };
  }
  async getReceipt(txHash: string): Promise<TransactionReceipt | null> {
    await this.checkConnection();
    const receipt = object(object(await this.api(`/chains/ethereum/transactions/receipt/${txHash}`)).data);
    const transactionHash = hex(receipt.transactionHash, 32); const blockNumber = quantity(receipt.blockNumber); const blockHash = hex(receipt.blockHash, 32);
    const status = quantity(receipt.status);
    if (status !== 0 && status !== 1 || !Array.isArray(receipt.logs)) throw unavailable();
    const block = object(await this.api(`/chains/ethereum/blocks/${blockNumber}`));
    const canonical = blockNumber >= this.config.deploymentBlock && hex(block.hash, 32) === blockHash && decimal(block.number) === blockNumber;
    const events: RegistrationEvent[] = [];
    for (const value of receipt.logs) {
      const log = object(value); const emitter = hex(log.address, 20);
      if (emitter !== this.config.address || log.removed === true) continue;
      if (!Array.isArray(log.topics)) throw unavailable();
      const topics = log.topics.map((topic: unknown) => hex(topic, 32));
      if (topics[0] !== id(eventSignature)) continue;
      if (!canonical || bool(log.removed) || quantity(log.blockNumber) !== blockNumber || hex(log.blockHash, 32) !== blockHash || hex(log.transactionHash, 32) !== transactionHash) continue;
      try {
        const decoded = registryInterface.parseLog({ topics, data: hex(log.data) });
        if (!decoded) throw unavailable();
        const cardId = string(decoded.args[1]);
        if (hex(decoded.args[0], 32) !== id(cardId)) continue;
        events.push({ emitter, cardId, owner: hex(decoded.args[2], 20), nickname: string(decoded.args[3]), transactionHash, blockNumber });
      } catch { throw unavailable(); }
    }
    return { transactionHash, status: status === 1 ? "success" : "reverted", blockNumber, blockHash, canonical, events };
  }
  async findRegistrationEvent(cardId: string): Promise<RegistrationEvent | null> {
    await this.checkConnection();
    for (let page = 0; page < 10; page++) {
      const query = new URLSearchParams({ contract_address: this.config.address, event_signature: eventSignature, limit: "10", offset: String(page * 10) });
      const entries = await this.api(`/events?${query}`);
      if (!Array.isArray(entries) || entries.length > 10) throw unavailable();
      for (const entry of entries) {
        const result = object(entry); const event = object(result.event);
        if (hex(object(event.contract).address, 20) !== this.config.address || event.signature !== eventSignature) continue;
        if (!Array.isArray(event.inputs)) throw unavailable();
        const inputs = new Map(event.inputs.map((value: unknown) => { const item = object(value); return [string(item.name), item.value]; }));
        if (inputs.get("cardId") !== cardId || inputs.get("cardKey") !== id(cardId)) continue;
        const hash = hex(object(result.transaction).txHash, 32);
        const receipt = await this.getReceipt(hash);
        if (!receipt || receipt.transactionHash !== hash || receipt.canonical === false || receipt.status !== "success" || receipt.blockNumber < this.config.deploymentBlock) continue;
        const transaction = await this.getTransaction(hash);
        if (!transaction || transaction.hash !== hash || transaction.pending || transaction.chainId !== this.config.chainId || transaction.to !== this.config.address || transaction.registration?.cardId !== cardId) continue;
        const matching = receipt.events.find((item) => item.cardId === cardId && item.owner === transaction.from && item.nickname === transaction.registration?.nickname);
        if (matching) return matching;
      }
      if (entries.length < 10) return null;
    }
    throw unavailable();
  }
}
export function createLiveGateway(env: Record<string, string | undefined>): MultiBaasGateway {
  return new MultiBaasGateway(parseLiveConfig(env));
}
