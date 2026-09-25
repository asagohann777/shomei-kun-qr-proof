import assert from "node:assert/strict";
import { test } from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import contract from "../src/generated/contract.json";
import { sample, scenarios } from "../src/generated/fixtures";

const base = process.env.API_TEST_URL ?? "http://127.0.0.1:3000";
assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/);
const ajv = new Ajv2020({ strict: false });
ajv.addSchema(contract, "contract");
const body = { walletAddress: sample.walletAddress, chainId: 80002, nickname: sample.nickname };
const cardPath = `/api/v1/cards/${sample.cardId}`;
const preparePath = `${cardPath}/registration/prepare`;
const transactionPath = `${cardPath}/transactions/${sample.transactionHash}`;
const requests = {
  getCard: { path: cardPath, method: "GET" },
  prepareRegistration: { path: preparePath, method: "POST" },
  getRegistrationTransaction: { path: transactionPath, method: "GET" },
};
const responseSchema = { getCard: "CardResponse", prepareRegistration: "PrepareResponse", getRegistrationTransaction: "TransactionResponse" };

async function call(path: string, init: RequestInit = {}) {
  const response = await fetch(base + path, init);
  assert.ok(response.headers.get("cache-control")?.split(",").map((directive) => directive.trim()).includes("no-store"));
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  const value: unknown = await response.json();
  return { status: response.status, value };
}

for (const operation of ["getCard", "prepareRegistration", "getRegistrationTransaction"] as const) {
  const cases = scenarios[operation];
  const request = requests[operation];
  const entries: [string, { status: number; example: keyof typeof contract.components.examples }][] = Object.entries(cases);
  for (const [scenario, outcome] of entries) {
    test(`HTTP ${operation} / ${scenario}`, async () => {
      const result = await call(request.path, {
        method: request.method,
        headers: { "X-Mock-Scenario": scenario, "Content-Type": "application/json" },
        ...(request.method === "POST" ? { body: JSON.stringify(body) } : {}),
      });
      assert.equal(result.status, outcome.status);
      assert.deepEqual(result.value, contract.components.examples[outcome.example].value);
      const schema = outcome.status === 200 ? responseSchema[operation] : "ErrorResponse";
      const validate = ajv.getSchema(`contract#/components/schemas/${schema}`);
      assert.ok(validate);
      assert.ok(validate(result.value), JSON.stringify(validate.errors));
    });
  }
}

async function expectError(path: string, status: number, code: string, init: RequestInit = {}) {
  const result = await call(path, init);
  assert.equal(result.status, status);
  assert.ok(ajv.getSchema("contract#/components/schemas/ErrorResponse")?.(result.value));
  assert.ok(result.value && typeof result.value === "object" && "error" in result.value);
  assert.ok(result.value.error && typeof result.value.error === "object" && "code" in result.value.error);
  assert.equal(result.value.error.code, code);
}
const post = (value: unknown): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });

test("HTTP defaults are independent happy fixtures", async () => {
  for (const operation of ["getCard", "prepareRegistration", "getRegistrationTransaction"] as const) {
    const request = requests[operation];
    const result = await call(request.path, request.method === "POST" ? post(body) : {});
    const example = scenarios[operation].default.example;
    assert.deepEqual(result.value, contract.components.examples[example].value);
  }
});
test("HTTP input errors and registration constraints", async () => {
  await expectError("/api/v1/cards/UNISSUED", 404, "CARD_NOT_FOUND");
  await expectError("/api/v1/cards/bad%20id", 400, "INVALID_INPUT");
  await expectError(cardPath, 400, "INVALID_MOCK_SCENARIO", { headers: { "X-Mock-Scenario": "pending" } });
  await expectError(cardPath, 400, "INVALID_MOCK_SCENARIO", { headers: { "X-Mock-Scenario": "bogus" } });
  await expectError(preparePath, 422, "CHAIN_MISMATCH", post({ ...body, chainId: 1 }));
  await expectError(preparePath, 422, "WALLET_NOT_ALLOWED", post({ ...body, walletAddress: "0x" + "5".repeat(40) }));
  await expectError(preparePath, 422, "MOCK_SAMPLE_UNSUPPORTED", post({ ...body, nickname: sample.nickname + " " }));
  for (const value of [null, [], { ...body, extra: true }, { ...body, chainId: "80002" }, { ...body, nickname: "" }, { ...body, walletAddress: "0x123" }]) {
    await expectError(preparePath, 400, "INVALID_INPUT", post(value));
  }
  await expectError(preparePath, 400, "INVALID_INPUT", { ...post(body), body: "{" });
  await expectError(preparePath, 415, "UNSUPPORTED_MEDIA_TYPE", { method: "POST", body: JSON.stringify(body) });
  await expectError(preparePath, 413, "PAYLOAD_TOO_LARGE", post({ ...body, nickname: "あ".repeat(6000) }));
  await expectError(transactionPath.replace(sample.transactionHash, "0x123"), 400, "INVALID_INPUT");
});
test("HTTP uppercase addresses and hashes normalize", async () => {
  const address = "0x" + sample.walletAddress.slice(2).toUpperCase();
  assert.deepEqual((await call(preparePath, post({ ...body, walletAddress: address }))).value, contract.components.examples.prepared.value);
  assert.deepEqual((await call(transactionPath.replace(sample.transactionHash, "0x" + sample.transactionHash.slice(2).toUpperCase()))).value, contract.components.examples.confirmed.value);
});
test("HTTP unknown hashes cannot manufacture confirmation", async () => {
  const path = transactionPath.replace(sample.transactionHash, "0x" + "b".repeat(64));
  const result = await call(path);
  assert.deepEqual(result.value, { meta: { mode: "mock" }, data: {
    cardId: sample.cardId, transactionHash: "0x" + "b".repeat(64), status: "unknown", reason: "TRANSACTION_NOT_SEEN",
  } });
  await expectError(path, 503, "UPSTREAM_UNAVAILABLE", { headers: { "X-Mock-Scenario": "unavailable" } });
});
test("HTTP parallel scenarios and repeated preparation do not mutate records", async () => {
  const results = await Promise.all(Array.from({ length: 12 }, (_, index) => {
    const scenario = index % 2 === 0 ? "unregistered" : "registered";
    return call(cardPath, { headers: { "X-Mock-Scenario": scenario } }).then((result) => {
      assert.deepEqual(result.value, contract.components.examples[scenario].value);
    });
  }));
  assert.equal(results.length, 12);
  await call(preparePath, post(body));
  await call(preparePath, post(body));
  assert.deepEqual((await call(cardPath, { headers: { "X-Mock-Scenario": "unregistered" } })).value, contract.components.examples.unregistered.value);
});
