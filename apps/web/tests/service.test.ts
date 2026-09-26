// SPDX-License-Identifier: MIT
import assert from "node:assert/strict";
import { test } from "node:test";
import { createMockGateway } from "../src/backend/mock-gateway";
import { getCard, getRegistrationTransaction, prepareRegistration } from "../src/backend/service";
import { ApiError, GatewayUnavailableError, type RegistrationGateway, type ChainTransaction, type TransactionReceipt, type CardRecord, type RegistrationEvent } from "../src/backend/domain";
import { sample } from "../src/generated/fixtures";

const otherAddress = "0x" + "5".repeat(40);
const otherHash = "0x" + "b".repeat(64);
const cardId = sample.cardId;
const txHash = sample.transactionHash;
const input = { walletAddress: sample.walletAddress, chainId: 80002, nickname: sample.nickname };
const baseGateway = () => createMockGateway({ operation: "getRegistrationTransaction", scenario: "registered" });
const check = (gateway: RegistrationGateway) => getRegistrationTransaction({ cardId, txHash, gateway });
const mismatch = { cardId, transactionHash: txHash, status: "unknown", reason: "RECORD_MISMATCH" };

async function changedTransaction(change: (tx: ChainTransaction) => ChainTransaction): Promise<RegistrationGateway> {
  const gateway = baseGateway();
  const original = await gateway.getTransaction(txHash);
  assert.ok(original);
  return { ...gateway, getTransaction: async () => change(original) };
}
async function changedReceipt(change: (receipt: TransactionReceipt) => TransactionReceipt): Promise<RegistrationGateway> {
  const gateway = baseGateway();
  const original = await gateway.getReceipt(txHash);
  assert.ok(original);
  return { ...gateway, getReceipt: async () => change(original) };
}
async function changedCard(change: (card: CardRecord) => CardRecord): Promise<RegistrationGateway> {
  const gateway = baseGateway();
  const original = await gateway.readCard(cardId);
  assert.ok(original);
  return { ...gateway, readCard: async () => change(original) };
}

test("B05 matching transaction, receipt, event and current owner confirm", async () => {
  assert.deepEqual(await check(baseGateway()), {
    cardId: "SK-2026-001", transactionHash: "0x" + "a".repeat(64), status: "confirmed",
    owner: { address: sample.walletAddress, nickname: "おじいちゃんコンビニ" }, blockNumber: 100,
  });
});
for (const [name, change] of Object.entries({
  chain: (tx: ChainTransaction) => ({ ...tx, chainId: 1 }),
  target: (tx: ChainTransaction) => ({ ...tx, to: otherAddress }),
  sender: (tx: ChainTransaction) => ({ ...tx, from: otherAddress }),
  hash: (tx: ChainTransaction) => ({ ...tx, hash: otherHash }),
})) {
  test(`B05 transaction ${name} mismatch cannot confirm`, async () => {
    assert.deepEqual(await check(await changedTransaction(change)), mismatch);
  });
}
for (const [name, change] of Object.entries({
  hash: (receipt: TransactionReceipt) => ({ ...receipt, transactionHash: otherHash }),
  block: (receipt: TransactionReceipt) => ({ ...receipt, blockNumber: 101 }),
  absentEvent: (receipt: TransactionReceipt) => ({ ...receipt, events: [] }),
})) {
  test(`B05 receipt ${name} mismatch cannot confirm`, async () => {
    assert.deepEqual(await check(await changedReceipt(change)), mismatch);
  });
}
const eventChanges: Record<string, (event: RegistrationEvent) => RegistrationEvent> = {
  emitter: (event) => ({ ...event, emitter: otherAddress }),
  card: (event) => ({ ...event, cardId: "SK-2026-002" }),
  owner: (event) => ({ ...event, owner: otherAddress }),
  nickname: (event) => ({ ...event, nickname: "別名" }),
  hash: (event) => ({ ...event, transactionHash: otherHash }),
};
for (const [name, change] of Object.entries(eventChanges)) {
  test(`B05 event ${name} mismatch cannot confirm`, async () => {
    assert.deepEqual(await check(await changedReceipt((receipt) => ({ ...receipt, events: receipt.events.map(change) }))), mismatch);
  });
}
const cardChanges: Record<string, (card: CardRecord) => CardRecord> = {
  cardId: (card) => ({ ...card, cardId: "SK-2026-002" }),
  state: (card) => ({ kind: "unregistered", cardId: card.cardId, playerName: card.playerName, allowedWallet: card.allowedWallet }),
  owner: (card) => card.kind === "registered" ? { ...card, owner: { ...card.owner, address: otherAddress } } : card,
  nickname: (card) => card.kind === "registered" ? { ...card, owner: { ...card.owner, nickname: "別名" } } : card,
  allowedWallet: (card) => ({ ...card, allowedWallet: otherAddress }),
};
for (const [name, change] of Object.entries(cardChanges)) {
  test(`B05 current card ${name} mismatch cannot confirm`, async () => {
    const gateway = await changedCard(change);
    assert.deepEqual(await check(gateway), mismatch);
  });
}

test("B06 pending, unseen, reverted and upstream errors remain distinct", async () => {
  const gateway = baseGateway();
  assert.deepEqual(await check({ ...gateway, getTransaction: async () => null }), { cardId, transactionHash: txHash, status: "unknown", reason: "TRANSACTION_NOT_SEEN" });
  assert.deepEqual(await check({ ...gateway, getReceipt: async () => null }), { cardId, transactionHash: txHash, status: "pending" });
  assert.deepEqual(await check(await changedReceipt((receipt) => ({ ...receipt, status: "reverted", events: [] }))), { cardId, transactionHash: txHash, status: "reverted" });
  await assert.rejects(check({ ...gateway, getReceipt: async () => { throw new GatewayUnavailableError(); } }), GatewayUnavailableError);
  const wrongTarget = await changedTransaction((tx) => ({ ...tx, to: otherAddress }));
  assert.deepEqual(await check({ ...wrongTarget, getReceipt: async () => ({ transactionHash: txHash, status: "reverted", blockNumber: 100, events: [] }) }), mismatch);
});
test("B07 indexed event delay preserves owner; receipt logs still confirm", async () => {
  const gateway = { ...baseGateway(), findRegistrationEvent: async () => null };
  const card = await getCard({ cardId, gateway });
  assert.equal(card.status, "registered");
  assert.deepEqual(card.owner, { address: sample.walletAddress, nickname: "おじいちゃんコンビニ" });
  assert.deepEqual(card.evidence, { status: "pending" });
  assert.equal((await check(gateway)).status, "confirmed");
});
test("B02 prepared transaction cannot redirect wallet or transfer value", async () => {
  const gateway = createMockGateway({ operation: "prepareRegistration", scenario: "unregistered" });
  const transaction = await gateway.buildRegistrationTransaction({ cardId, ...input });
  for (const changed of [{ ...transaction, to: otherAddress }, { ...transaction, from: otherAddress }]) {
    await assert.rejects(prepareRegistration({ cardId, input, gateway: { ...gateway, buildRegistrationTransaction: async () => changed } }), (error: unknown) => error instanceof ApiError && error.status === 503);
  }
});
test("B09 mock gateway and service do not call fetch", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("External fetch forbidden"); });
  const gateway = baseGateway();
  assert.equal((await getCard({ cardId, gateway })).status, "registered");
  assert.equal((await check(gateway)).status, "confirmed");
  assert.equal((await prepareRegistration({ cardId, input, gateway: createMockGateway({ operation: "prepareRegistration", scenario: "unregistered" }) })).transaction.data, "0x");
});
