import assert from "node:assert/strict";
import { test } from "node:test";
import { id } from "ethers";
import { ApiError } from "../src/backend/domain";
import { parseLiveConfig } from "../src/backend/live-config";
import { MultiBaasGateway, registryInterface } from "../src/backend/multibaas-gateway";

const address = `0x${"11".repeat(20)}`;
const issuer = `0x${"22".repeat(20)}`;
const wallet = `0x${"33".repeat(20)}`;
const hash = `0x${"44".repeat(32)}`;
const blockHash = `0x${"55".repeat(32)}`;
const zero = `0x${"00".repeat(20)}`;
const cardId = "card-1";
const nickname = "おじいちゃんコンビニ";
const env = {
  MULTIBAAS_BASE_URL: "https://test.example/api/v0", MULTIBAAS_API_KEY: "server-only-secret",
  CHAIN_ID: "2017", REGISTRY_ADDRESS: address, REGISTRY_CONTRACT_LABEL: "registry", REGISTRY_CONTRACT_VERSION: "1.0.0",
  REGISTRY_DEPLOYMENT_BLOCK: "10", REGISTRY_ISSUER: issuer, CURVEGRID_PUBLIC_WEB3_RPC_URL: "https://rpc.example/public-key",
};
const calldata = registryInterface.encodeFunctionData("register", [cardId, nickname]);
const encodedLog = registryInterface.encodeEventLog("CardRegistered", [id(cardId), cardId, wallet, nickname]);
function log() { return { address, topics: encodedLog.topics, data: encodedLog.data, removed: false, transactionHash: hash, blockNumber: "0x14", blockHash }; }
function receipt() { return { data: { transactionHash: hash, status: "0x1", blockNumber: "0x14", blockHash, logs: [log()] } }; }
function transaction() { return { data: { hash, to: address, chainId: "0x7e1", value: "0x0", input: calldata }, from: wallet, isPending: false }; }
type Override = (path: string, body: Record<string, unknown> | undefined) => unknown;
function syntheticGateway(override?: Override) {
  const calls: { path: string; body: Record<string, unknown> | undefined; init: RequestInit | undefined }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input)); const path = url.pathname + url.search;
    const body: Record<string, unknown> | undefined = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ path, body, init });
    let result = override?.(path, body);
    if (result instanceof Response) return result;
    if (result === undefined) {
      if (url.hostname === "rpc.example") return Response.json({ jsonrpc: "2.0", id: 1, result: body?.method === "eth_chainId" ? "0x7e1" : "0x6000" });
      if (path.endsWith("/status")) result = { chainID: 2017, blockNumber: 20 };
      else if (path.endsWith(`/addresses/${address}`)) result = { address, contracts: [{ label: "registry", version: "1.0.0" }] };
      else if (path === "/api/v0/contracts/registry/1.0.0") result = { label: "registry", version: "1.0.0", rawAbi: registryInterface.formatJson() };
      else if (path.includes("/blocks/")) result = { number: "20", hash: blockHash };
      else if (path.endsWith("/issuer")) result = { output: issuer };
      else if (path.endsWith("/schemaVersion")) result = { output: "1" };
      else if (path.endsWith("/getCard")) result = { output: [true, wallet, true, wallet, nickname] };
      else if (path.endsWith("/register")) result = { submitted: false, tx: { from: wallet, to: address, data: calldata, value: "0" } };
      else if (path.includes("/transactions/receipt/")) result = receipt();
      else if (path.includes("/transactions/")) result = transaction();
      else if (path.startsWith("/api/v0/events?")) result = [];
      else throw new Error(`Unexpected request ${path}`);
    }
    return Response.json({ status: 200, message: "success", result });
  };
  return { gateway: new MultiBaasGateway(parseLiveConfig(env), fetcher), calls };
}
function code(expected: string) { return (error: unknown) => error instanceof ApiError && error.status === 503 && error.code === expected; }

test("missing live configuration reports names without secret values", () => {
  assert.throws(() => parseLiveConfig({ MULTIBAAS_API_KEY: "private" }), (error: unknown) => {
    assert.ok(error instanceof ApiError); assert.equal(error.code, "CONFIGURATION_MISSING");
    assert.ok(error.details?.missingSettings.includes("CHAIN_ID")); assert.ok(!JSON.stringify(error).includes("private")); return true;
  });
  for (const patch of [{ CHAIN_ID: "-1" }, { MULTIBAAS_BASE_URL: "http://example.com/api/v0" }, { REGISTRY_ADDRESS: zero }, { REGISTRY_CONTRACT_LABEL: "../other" }]) {
    assert.throws(() => parseLiveConfig({ ...env, ...patch }), code("CONNECTION_MISMATCH"));
  }
});
test("connection validates live chain, ABI, issuer and bytecode and exposes only public RPC", async () => {
  const { gateway, calls } = syntheticGateway();
  const connection = await gateway.checkConnection();
  assert.equal(connection.status, "ready"); assert.equal(connection.registry.chainId, 2017);
  assert.ok(!JSON.stringify(connection).includes(env.MULTIBAAS_API_KEY));
  assert.ok(calls.every((call) => call.init?.redirect === "error"));
  await gateway.readCard(cardId);
  assert.equal(calls.filter((call) => call.path.endsWith("/status")).length, 1);
});
test("wrong chain, issuer, linked version and ABI do not report ready", async () => {
  for (const [suffix, result] of [
    ["/status", { chainID: 80002 }], ["/issuer", { output: wallet }],
    [`/addresses/${address}`, { address, contracts: [{ label: "registry", version: "2" }] }],
    ["/contracts/registry/1.0.0", { label: "registry", version: "1.0.0", rawAbi: "[]" }],
  ] satisfies [string, unknown][]) {
    const { gateway } = syntheticGateway((path) => path.endsWith(suffix) ? result : undefined);
    await assert.rejects(gateway.checkConnection(), code("CONNECTION_MISMATCH"));
  }
});
test("upstream HTTP errors and malformed JSON never become an absent card", async () => {
  for (const status of [401, 403, 404, 429, 500]) {
    const { gateway } = syntheticGateway((path) => path.endsWith("/getCard") ? new Response("private upstream details", { status }) : undefined);
    await assert.rejects(gateway.readCard(cardId), code(status === 401 || status === 403 ? "MULTIBAAS_AUTH_FAILED" : "UPSTREAM_UNAVAILABLE"));
  }
  const { gateway } = syntheticGateway(() => new Response("not json"));
  await assert.rejects(gateway.checkConnection(), code("UPSTREAM_UNAVAILABLE"));
});
test("only validated exists=false means unissued; tuple and named outputs preserve nickname", async () => {
  const absent = syntheticGateway((path) => path.endsWith("/getCard") ? { output: [false, zero, false, zero, ""] } : undefined);
  assert.equal(await absent.gateway.readCard(cardId), null);
  const named = syntheticGateway((path) => path.endsWith("/getCard") ? { output: { exists: true, allowedWallet: wallet, registered: true, owner: wallet, nickname } } : undefined);
  assert.deepEqual(await named.gateway.readCard(cardId), { kind: "registered", cardId, playerName: "証明一郎", allowedWallet: wallet, owner: { address: wallet, nickname } });
  const invalid = syntheticGateway((path) => path.endsWith("/getCard") ? { output: ["false", zero, false, zero, ""] } : undefined);
  await assert.rejects(invalid.gateway.readCard(cardId), code("UPSTREAM_UNAVAILABLE"));
});
test("prepare is unsigned and rejects altered sender, target, value, card, nickname and chain", async () => {
  const good = syntheticGateway();
  assert.deepEqual(await good.gateway.buildRegistrationTransaction({ cardId, nickname, walletAddress: wallet }), { chainId: 2017, from: wallet, to: address, data: calldata, value: "0" });
  assert.equal(good.calls.at(-1)?.body?.signAndSubmit, false);
  for (const patch of [{ from: issuer }, { to: issuer }, { value: "1" }, { data: "0x" }, { chainId: 80002 }, { data: registryInterface.encodeFunctionData("register", ["other", nickname]) }, { data: registryInterface.encodeFunctionData("register", [cardId, "other"]) }]) {
    const { gateway } = syntheticGateway((path) => path.endsWith("/register") ? { submitted: false, tx: { from: wallet, to: address, data: calldata, value: "0", ...patch } } : undefined);
    await assert.rejects(gateway.buildRegistrationTransaction({ cardId, nickname, walletAddress: wallet }), code("UPSTREAM_UNAVAILABLE"));
  }
});
test("transaction pending is explicit and unrelated calldata is not a registration", async () => {
  const pending = syntheticGateway((path) => path.includes("/transactions/") ? { ...transaction(), isPending: true } : undefined);
  assert.deepEqual(await pending.gateway.getTransaction(hash), { hash, from: wallet, to: address, chainId: 2017, pending: true, registration: { cardId, nickname } });
  const other = syntheticGateway((path) => path.includes("/transactions/") ? { ...transaction(), data: { ...transaction().data, input: registryInterface.encodeFunctionData("issuer") } } : undefined);
  assert.equal((await other.gateway.getTransaction(hash))?.registration, undefined);
});
test("receipt verifies ABI logs and canonical block; stale and removed logs cannot confirm", async () => {
  const good = syntheticGateway();
  assert.deepEqual((await good.gateway.getReceipt(hash))?.events, [{ emitter: address, cardId, owner: wallet, nickname, transactionHash: hash, blockNumber: 20 }]);
  for (const patch of [{ removed: true }, { blockHash: hash }, { transactionHash: blockHash }]) {
    const { gateway } = syntheticGateway((path) => path.includes("/receipt/") ? { data: { ...receipt().data, logs: [{ ...log(), ...patch }] } } : undefined);
    assert.deepEqual((await gateway.getReceipt(hash))?.events, []);
  }
  const reorg = syntheticGateway((path) => path.endsWith("/blocks/20") ? { number: "20", hash } : undefined);
  assert.equal((await reorg.gateway.getReceipt(hash))?.canonical, false);
});
test("indexed event is only a candidate and must match transaction and receipt", async () => {
  const candidate = { event: { signature: "CardRegistered(bytes32,string,address,string)", contract: { address }, inputs: [{ name: "cardId", value: cardId }, { name: "cardKey", value: id(cardId) }] }, transaction: { txHash: hash } };
  const good = syntheticGateway((path) => path.startsWith("/api/v0/events?") ? [candidate] : undefined);
  assert.equal((await good.gateway.findRegistrationEvent(cardId))?.transactionHash, hash);
  const altered = syntheticGateway((path) => path.startsWith("/api/v0/events?") ? [candidate] : path.endsWith(`/transactions/${hash}`) ? { ...transaction(), data: { ...transaction().data, input: registryInterface.encodeFunctionData("register", [cardId, "other"]) } } : undefined);
  assert.equal(await altered.gateway.findRegistrationEvent(cardId), null);
  const empty = syntheticGateway(); assert.equal(await empty.gateway.findRegistrationEvent(cardId), null);
  const failed = syntheticGateway((path) => path.startsWith("/api/v0/events?") ? new Response("", { status: 500 }) : undefined);
  await assert.rejects(failed.gateway.findRegistrationEvent(cardId), code("UPSTREAM_UNAVAILABLE"));
});
test("fetch timeout aborts without retry", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  let requests = 0;
  const gateway = new MultiBaasGateway(parseLiveConfig(env), async (_input, init) => {
    requests++;
    return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))));
  });
  const pending = gateway.checkConnection();
  context.mock.timers.tick(10_000);
  await assert.rejects(pending, code("UPSTREAM_TIMEOUT")); assert.equal(requests, 1);
});

test("candidate hashes and canonical receipt must agree before exposing evidence", async () => {
  const candidate = { event: { signature: "CardRegistered(bytes32,string,address,string)", contract: { address }, inputs: [{ name: "cardId", value: cardId }, { name: "cardKey", value: id(cardId) }] }, transaction: { txHash: hash } };
  for (const mutation of ["transaction", "receipt", "block"]) {
    const { gateway } = syntheticGateway((path) => {
      if (path.startsWith("/api/v0/events?")) return [candidate];
      if (mutation === "transaction" && path.endsWith(`/transactions/${hash}`)) return { ...transaction(), data: { ...transaction().data, hash: blockHash } };
      if (mutation === "receipt" && path.includes("/receipt/")) return { data: { ...receipt().data, transactionHash: blockHash, logs: [{ ...log(), transactionHash: blockHash }] } };
      if (mutation === "block" && path.endsWith("/blocks/20")) return { number: "20", hash };
      return undefined;
    });
    assert.equal(await gateway.findRegistrationEvent(cardId), null);
  }
});
test("event scan limit fails instead of claiming no evidence", async () => {
  const irrelevant = { event: { signature: "CardRegistered(bytes32,string,address,string)", contract: { address }, inputs: [{ name: "cardId", value: "other" }, { name: "cardKey", value: id("other") }] } };
  const { gateway, calls } = syntheticGateway((path) => path.startsWith("/api/v0/events?") ? Array.from({ length: 100 }, () => irrelevant) : undefined);
  await assert.rejects(gateway.findRegistrationEvent(cardId), code("UPSTREAM_UNAVAILABLE"));
  assert.equal(calls.filter((call) => call.path.startsWith("/api/v0/events?")).length, 10);
});
test("30-second request budget prevents another upstream call", async (context) => {
  context.mock.timers.enable({ apis: ["Date"], now: 1_000 });
  const { gateway, calls } = syntheticGateway();
  await gateway.checkConnection();
  const before = calls.length;
  context.mock.timers.tick(30_001);
  await assert.rejects(gateway.readCard(cardId), code("UPSTREAM_TIMEOUT"));
  assert.equal(calls.length, before);
});
test("unpaired surrogate from upstream cannot become a public nickname", async () => {
  const { gateway } = syntheticGateway((path) => path.endsWith("/getCard") ? { output: [true, wallet, true, wallet, "\ud800"] } : undefined);
  await assert.rejects(gateway.readCard(cardId), code("UPSTREAM_UNAVAILABLE"));
});
