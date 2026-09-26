// SPDX-License-Identifier: MIT
import assert from "node:assert/strict";
import { test } from "node:test";
import { handlePrepareRequest, handleCardRequest, handleTransactionRequest } from "../src/backend/http";
import { runMockRegistration, submitWithMockWallet } from "../src/backend/mock-wallet";
import { sample } from "../src/generated/fixtures";
import contract from "../src/generated/contract.json";
import { PrepareResponse } from "../src/generated/validators.js";

const url = "http://localhost/api/v1/cards/SK-2026-001";
const input = { walletAddress: sample.walletAddress, nickname: sample.nickname, chainId: 80002 };
const prepared = contract.components.examples.prepared.value;
assert.ok(PrepareResponse(prepared));
const preparedFixture = prepared;

async function withMode(mode: string | undefined, run: () => Promise<void>) {
  const before = process.env.BACKEND_MODE;
  if (mode === undefined) delete process.env.BACKEND_MODE;
  else process.env.BACKEND_MODE = mode;
  try { await run(); } finally {
    if (before === undefined) delete process.env.BACKEND_MODE;
    else process.env.BACKEND_MODE = before;
  }
}

test("B10 streamed body uses actual bytes rather than Content-Length", async () => {
  await withMode("mock", async () => {
    const encoder = new TextEncoder();
    let cancelled = false;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('{"nickname":"'));
        controller.enqueue(encoder.encode("あ".repeat(6000)));
      },
      cancel() { cancelled = true; },
    });
    const init = { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": "1" }, body: stream, duplex: "half" };
    const result = await handlePrepareRequest(new Request(url, init), sample.cardId);
    assert.equal(result.status, 413);
    assert.equal(cancelled, true);
  });
});
test("B10 body at 16 KiB accepted, one byte over rejected", async () => {
  await withMode("mock", async () => {
    const json = JSON.stringify(input);
    const padding = 16384 - new TextEncoder().encode(json).byteLength;
    for (const [extra, status] of [[0, 200], [1, 413]] as const) {
      const request = new Request(url, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: json + " ".repeat(padding + extra) });
      assert.equal((await handlePrepareRequest(request, sample.cardId)).status, status);
    }
  });
});
test("B10 split multibyte UTF-8 is decoded, malformed UTF-8 rejected", async () => {
  await withMode("mock", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify(input));
    const stream = new ReadableStream({ start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    } });
    const init = { method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half" };
    assert.equal((await handlePrepareRequest(new Request(url, init), sample.cardId)).status, 200);
    const bad = new Request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: new Uint8Array([255]) });
    assert.equal((await handlePrepareRequest(bad, sample.cardId)).status, 400);
  });
});
test("B11 runtime rejects unset mode and live mock headers", async () => {
  await withMode(undefined, async () => {
    assert.equal((await handleCardRequest(new Request(url), sample.cardId)).status, 500);
  });
  await withMode("live", async () => {
    const response = await handleCardRequest(new Request(url, { headers: { "X-Mock-Scenario": "registered" } }), sample.cardId);
    assert.equal(response.status, 400);
    assert.equal((await handleCardRequest(new Request(url), sample.cardId)).status, 503);
  });
});
test("B01 precedence: input, scenario, card, outage, then hash", async () => {
  await withMode("mock", async () => {
    const badScenario = new Request(url, { headers: { "X-Mock-Scenario": "invalid" } });
    assert.equal((await handleCardRequest(badScenario, "UNISSUED")).status, 400);
    const outage = new Request(url, { headers: { "X-Mock-Scenario": "unavailable" } });
    assert.equal((await handleCardRequest(outage, "UNISSUED")).status, 404);
    assert.equal((await handleTransactionRequest(outage, sample.cardId, "0x" + "b".repeat(64))).status, 503);
  });
});
test("B08 rejecting mock approval never starts transaction verification", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("Network forbidden"); });
  let calls = 0;
  const result = await runMockRegistration({ prepared: preparedFixture, approve: async () => false, verify: async () => { calls++; throw new Error("Must not verify"); } });
  assert.deepEqual(result, { status: "rejected" });
  assert.equal(calls, 0);
});
test("B08 unknown verification does not resubmit or retry automatically", async () => {
  let approvals = 0;
  let verifications = 0;
  const result = await runMockRegistration({
    prepared: preparedFixture,
    approve: async () => { approvals++; return true; },
    verify: async (transactionHash) => {
      verifications++;
      assert.equal(transactionHash, sample.transactionHash);
      return { cardId: sample.cardId, transactionHash, status: "unknown", reason: "TRANSACTION_NOT_SEEN" };
    },
  });
  assert.equal(result.status, "checked");
  assert.equal(approvals, 1);
  assert.equal(verifications, 1);
});
test("B09 mock wallet rejects live envelopes and never uses network", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("Network forbidden"); });
  const approve = async () => true;
  await assert.rejects(submitWithMockWallet({ prepared: { ...preparedFixture, meta: { mode: "live" } }, approve }), /Invalid mock transaction/);
  assert.deepEqual(await submitWithMockWallet({ prepared: preparedFixture, approve }), { status: "submitted", transactionHash: sample.transactionHash });
});
