import assert from "node:assert/strict";
import { test } from "node:test";
import { handleCardRequest, handleConnectionRequest, handlePrepareRequest } from "../src/backend/http";
import { ConnectionResponse, ErrorResponse } from "../src/generated/validators.js";
import { sample } from "../src/generated/fixtures";

async function configured(env: Record<string, string | undefined>, run: () => Promise<void>) {
  const old = { ...process.env };
  for (const name of Object.keys(process.env)) if (/^(MULTIBAAS_|REGISTRY_|CURVEGRID_|CHAIN_ID|ALLOWED_UI_ORIGINS|PUBLIC_API_ORIGIN|BACKEND_MODE)/.test(name)) delete process.env[name];
  Object.assign(process.env, env);
  try { await run(); } finally { process.env = old; }
}
const base = "https://api.example";
const live = { BACKEND_MODE: "live", PUBLIC_API_ORIGIN: base, ALLOWED_UI_ORIGINS: "https://ui.example" };
const input = { walletAddress: sample.walletAddress, chainId: 2017, nickname: "自由入力" };
const prepare = (nickname: string) => new Request(`${base}/api/v1/cards/card-1/registration/prepare`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, nickname }) });

test("live missing configuration responds 503 with names, mode and no-store", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("Must not contact upstream"); });
  await configured({ ...live, MULTIBAAS_API_KEY: "secret-do-not-leak" }, async () => {
    for (const handler of [() => handleConnectionRequest(new Request(base)), () => handleCardRequest(new Request(base), "card-1")]) {
      const response = await handler();
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("cache-control"), "no-store");
      const value: unknown = await response.json();
      assert.ok(ErrorResponse(value));
      assert.equal(value.meta.mode, "live");
      assert.equal(value.error.code, "CONFIGURATION_MISSING");
      if (value.error.code === "CONFIGURATION_MISSING") assert.ok(value.error.details.missingSettings.includes("CHAIN_ID"));
      assert.ok(!JSON.stringify(value).includes("secret-do-not-leak"));
    }
  });
});
test("mock connection is explicitly mock and performs no network calls", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("Must not contact upstream"); });
  await configured({ BACKEND_MODE: "mock" }, async () => {
    const response = await handleConnectionRequest(new Request(base));
    const value: unknown = await response.json();
    assert.equal(response.status, 200); assert.ok(ConnectionResponse(value));
    assert.equal(value.meta.mode, "mock"); assert.equal(value.data.status, "mock");
  });
});
test("live UTF-8 limit and Unicode validation precede upstream configuration", async () => {
  await configured(live, async () => {
    for (const [nickname, status] of [["a", 503], ["あ".repeat(32), 503], ["a".repeat(96), 503], ["a".repeat(97), 400], ["あ".repeat(33), 400], ["", 400], ["\ud800", 400], ["😀", 503], ["  a  ", 503]] satisfies [string, number][]) {
      assert.equal((await handlePrepareRequest(prepare(nickname), "card-1")).status, status);
    }
  });
});
test("CORS allows exact UI/same origin, CLI without Origin and preflight; rejects null and prefixes", async () => {
  await configured(live, async () => {
    for (const origin of [base, "https://ui.example"]) {
      const response = await handleConnectionRequest(new Request(base, { headers: { Origin: origin } }));
      assert.equal(response.status, 503); assert.equal(response.headers.get("access-control-allow-origin"), origin);
      assert.equal(response.headers.get("vary"), "Origin"); assert.equal(response.headers.get("access-control-allow-credentials"), null);
      const preflight = await handleConnectionRequest(new Request(base, { method: "OPTIONS", headers: { Origin: origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type" } }));
      assert.equal(preflight.status, 204); assert.equal(await preflight.text(), "");
      assert.equal(preflight.headers.get("cache-control"), "no-store");
    }
    for (const origin of ["null", "https://ui.example.attacker.com", "https://bad.example"]) {
      const response = await handleConnectionRequest(new Request(base, { headers: { Origin: origin } }));
      assert.equal(response.status, 403); assert.equal(response.headers.get("access-control-allow-origin"), null);
    }
    assert.equal((await handleConnectionRequest(new Request(base))).status, 503);
    assert.equal((await handleConnectionRequest(new Request(base, { method: "OPTIONS", headers: { Origin: base, "Access-Control-Request-Method": "DELETE" } }))).status, 403);
  });
});
test("live rejects mock header with its reserved code even when configuration is missing", async () => {
  await configured(live, async () => {
    const response = await handleCardRequest(new Request(base, { headers: { "X-Mock-Scenario": "default" } }), sample.cardId);
    assert.equal(response.status, 400); const value: unknown = await response.json();
    assert.ok(ErrorResponse(value)); assert.equal(value.error.code, "INVALID_MOCK_SCENARIO");
  });
});

test('wallet rejection logs correlate with the response without exposing private inputs', async (t) => {
  const warning = t.mock.method(console, 'warn', () => {});
  await configured({ BACKEND_MODE: 'mock' }, async () => {
    const walletAddress = '0x5555555555555555555555555555555555555555';
    const response = await handlePrepareRequest(new Request(`${base}/api/v1/cards/${sample.cardId}/registration/prepare`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, chainId: sample.chainId, nickname: 'do-not-log-this-name' }),
    }), sample.cardId);
    assert.equal(response.status, 422);
    const requestId = response.headers.get('x-request-id');
    assert.match(requestId ?? '', /^[a-f0-9-]{36}$/);
    assert.equal(response.headers.get('access-control-expose-headers'), 'X-Request-ID');
    const log = JSON.stringify(warning.mock.calls.map(call => call.arguments));
    assert(log.includes(requestId ?? 'missing'));
    assert(log.includes(walletAddress)); assert(log.includes(sample.walletAddress));
    assert(!log.includes('do-not-log-this-name'));
    const body = await response.json();
    assert.equal(body.error.code, 'WALLET_NOT_ALLOWED');
    assert.equal(body.error.diagnostics, undefined);
  });
});
