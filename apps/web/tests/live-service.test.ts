// SPDX-License-Identifier: MIT
import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError, type CardRecord, type ChainTransaction, type RegistrationEvent, type RegistrationGateway, type TransactionReceipt } from "../src/backend/domain";
import { getCard, getRegistrationTransaction, prepareRegistration } from "../src/backend/service";
import { registryInterface } from "../src/backend/multibaas-gateway";

const contractAddress = `0x${"11".repeat(20)}`;
const wallet = `0x${"22".repeat(20)}`;
const issuer = `0x${"33".repeat(20)}`;
const txHash = `0x${"44".repeat(32)}`;
const cardId = "live-card";
const nickname = "自由な名前";
const chainId = 2017;
const owner = { address: wallet, nickname };
const card: CardRecord = { kind: "registered", cardId, playerName: "証明一郎", allowedWallet: wallet, owner };
const transaction: ChainTransaction = { hash: txHash, chainId, from: wallet, to: contractAddress, registration: { cardId, nickname }, pending: false };
const event: RegistrationEvent = { emitter: contractAddress, cardId, owner: wallet, nickname, transactionHash: txHash, blockNumber: 20 };
const receipt: TransactionReceipt = { transactionHash: txHash, status: "success", blockNumber: 20, canonical: true, events: [event] };
function gateway(overrides: Partial<RegistrationGateway> = {}): RegistrationGateway {
  return {
    mode: "live", registry: { chainId, contractAddress, issuer },
    readCard: async () => card,
    buildRegistrationTransaction: async (input) => ({ chainId, from: input.walletAddress, to: contractAddress, value: "0", data: registryInterface.encodeFunctionData("register", [input.cardId, input.nickname]) }),
    getTransaction: async () => transaction,
    getReceipt: async () => receipt,
    findRegistrationEvent: async () => event,
    ...overrides,
  };
}
const unknown = { cardId, transactionHash: txHash, status: "unknown", reason: "RECORD_MISMATCH" };
test("live service accepts configured non-Amoy chain and a free nickname", async () => {
  const port = gateway({ readCard: async () => ({ kind: "unregistered", cardId, playerName: "証明一郎", allowedWallet: wallet }) });
  const prepared = await prepareRegistration({ cardId, input: { chainId, walletAddress: wallet, nickname }, gateway: port });
  assert.equal(prepared.nickname, "自由な名前"); assert.equal(prepared.transaction.chainId, 2017);
  const decoded = registryInterface.parseTransaction({ data: prepared.transaction.data });
  assert.equal(decoded?.args[0], "live-card"); assert.equal(decoded?.args[1], "自由な名前");
});
test("pending registration avoids unavailable receipt and never submits", async () => {
  const port = gateway({
    getTransaction: async () => ({ ...transaction, pending: true }),
    getReceipt: async () => { assert.fail("pending must not fetch receipt"); },
    buildRegistrationTransaction: async () => { assert.fail("confirmation must not prepare or submit"); },
  });
  assert.deepEqual(await getRegistrationTransaction({ cardId, txHash, gateway: port }), { cardId, transactionHash: txHash, status: "pending" });
});
test("other card, name, sender, chain, target or unsupported function cannot confirm", async () => {
  for (const patch of [
    { registration: { cardId: "other", nickname } }, { registration: { cardId, nickname: "other" } },
    { registration: undefined }, { from: issuer }, { chainId: 80002 }, { to: issuer },
  ] satisfies Partial<ChainTransaction>[]) {
    const port = gateway({ getTransaction: async () => ({ ...transaction, pending: true, ...patch }), getReceipt: async () => { assert.fail("mismatch must stop before receipt"); } });
    assert.deepEqual(await getRegistrationTransaction({ cardId, txHash, gateway: port }), unknown);
  }
});
test("reorganized success and reverted receipts are unknown", async () => {
  for (const status of ["success", "reverted"] satisfies TransactionReceipt["status"][]) {
    assert.deepEqual(await getRegistrationTransaction({ cardId, txHash, gateway: gateway({ getReceipt: async () => ({ ...receipt, status, canonical: false }) }) }), unknown);
  }
});
test("canonical matching receipt confirms without the event index", async () => {
  const port = gateway({ findRegistrationEvent: async () => { assert.fail("transaction confirmation must use receipt directly"); } });
  assert.deepEqual(await getRegistrationTransaction({ cardId, txHash, gateway: port }), { cardId, transactionHash: txHash, status: "confirmed", owner, blockNumber: 20 });
});
test("altered receipt event cannot confirm", async () => {
  for (const patch of [{ cardId: "other" }, { nickname: "other" }, { owner: issuer }, { emitter: issuer }, { blockNumber: 21 }, { transactionHash: `0x${"55".repeat(32)}` }]) {
    const port = gateway({ getReceipt: async () => ({ ...receipt, events: [{ ...event, ...patch }] }) });
    assert.deepEqual(await getRegistrationTransaction({ cardId, txHash, gateway: port }), unknown);
  }
});
test("event indexing delay retains current owner, but communication failure remains an error", async () => {
  const result = await getCard({ cardId, gateway: gateway({ findRegistrationEvent: async () => null }) });
  assert.deepEqual(result, { cardId, playerName: "証明一郎", registry: { chainId, contractAddress, issuer }, status: "registered", owner, evidence: { status: "pending" } });
  await assert.rejects(getCard({ cardId, gateway: gateway({ findRegistrationEvent: async () => { throw new ApiError(503, "UPSTREAM_UNAVAILABLE", "Unavailable"); } }) }), (error: unknown) => error instanceof ApiError && error.status === 503);
});
test("a matching failed transaction is reverted and a missing transaction is unknown", async () => {
  assert.deepEqual(await getRegistrationTransaction({ cardId, txHash, gateway: gateway({ getReceipt: async () => ({ ...receipt, status: "reverted", events: [] }) }) }), { cardId, transactionHash: txHash, status: "reverted" });
  assert.deepEqual(await getRegistrationTransaction({ cardId, txHash, gateway: gateway({ getTransaction: async () => null }) }), { cardId, transactionHash: txHash, status: "unknown", reason: "TRANSACTION_NOT_SEEN" });
});

test("open cards prepare a transaction for any connected sender", async () => {
  const port = gateway({ readCard: async () => ({ kind: "unregistered", cardId, playerName: "証明一郎", allowedWallet: "0x0000000000000000000000000000000000000000" }) });
  for (const walletAddress of [wallet, issuer]) {
    const result = await prepareRegistration({ cardId, input: { chainId, walletAddress, nickname }, gateway: port });
    assert.equal(result.transaction.from, walletAddress);
    assert.equal(result.transaction.value, "0");
  }
});

test('open card confirmation checks the actual owner, not the open permission sentinel', async () => {
  const allowedWallet = '0x0000000000000000000000000000000000000000';
  const port = gateway({ readCard: async () => ({ ...card, allowedWallet }) });
  assert.equal((await getCard({ cardId, gateway: port })).evidence.status, 'available');
  assert.equal((await getRegistrationTransaction({ cardId, txHash, gateway: port })).status, 'confirmed');
  const wrongSender = gateway({ readCard: port.readCard, getTransaction: async () => ({ ...transaction, from: issuer }) });
  assert.deepEqual(await getRegistrationTransaction({ cardId, txHash, gateway: wrongSender }), unknown);
  const pending = gateway({ readCard: async () => ({ kind: 'unregistered', cardId, playerName: '証明一郎', allowedWallet }), getTransaction: async () => ({ ...transaction, pending: true }) });
  assert.equal((await getRegistrationTransaction({ cardId, txHash, gateway: pending })).status, 'pending');
});
