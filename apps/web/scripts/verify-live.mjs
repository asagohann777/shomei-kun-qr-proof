// SPDX-License-Identifier: MIT
import assert from "node:assert/strict";

const [origin, cardId, hash] = process.argv.slice(2);
if (!origin || !cardId || !hash) throw new Error("Usage: node scripts/verify-live.mjs API_ORIGIN CARD_ID REGISTRATION_HASH");
const results = [];
async function call(path, init) {
  const response = await fetch(`${origin}/api/v1${path}`, init);
  const body = await response.json();
  if (body.data?.network) delete body.data.network.rpcUrls;
  results.push({ path, method: init?.method ?? "GET", status: response.status, body });
  assert.equal(body.meta.mode, "live");
  return { status: response.status, ...body };
}
const connection = await call("/connection");
assert.equal(connection.status, 200);
assert.equal(connection.data.status, "ready");
const path = `/cards/${encodeURIComponent(cardId)}`;
const card = await call(path);
assert.equal(card.status, 200);
assert.equal(card.data.status, "registered");
assert.equal(card.data.owner.nickname, "おじいちゃんコンビニ");
assert.equal(card.data.evidence.transactionHash, hash);
assert.deepEqual((await call(path)).data, card.data);
const tx = await call(`${path}/transactions/${hash}`);
assert.equal(tx.status, 200);
assert.equal(tx.data.status, "confirmed");
assert.deepEqual(tx.data.owner, card.data.owner);
const duplicate = await call(`${path}/registration/prepare`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chainId: connection.data.network.chainId, walletAddress: card.data.owner.address, nickname: "上書き" }) });
assert.equal(duplicate.status, 409);
assert.equal(duplicate.error.code, "ALREADY_REGISTERED");
console.log(JSON.stringify({ observedAt: new Date().toISOString(), origin, results }, null, 2));
