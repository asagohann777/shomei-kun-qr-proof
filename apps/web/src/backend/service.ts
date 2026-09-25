import { sample } from "../generated/fixtures";
import {
  ApiError,
  sameHex,
  type Card,
  type CardId,
  type CardRecord,
  type PrepareInput,
  type PreparedRegistration,
  type RegistrationEvent,
  type RegistrationGateway,
  type RegistrationTransaction,
  type TransactionHash,
} from "./domain";

async function requireCard(gateway: RegistrationGateway, cardId: CardId): Promise<CardRecord> {
  const card = await gateway.readCard(cardId);
  if (card === null) {
    throw new ApiError(404, "CARD_NOT_FOUND", "Card not found");
  }
  return card;
}

function eventMatchesCard(
  event: RegistrationEvent,
  card: Extract<CardRecord, { kind: "registered" }>,
  gateway: RegistrationGateway,
): boolean {
  return (
    event.cardId === card.cardId &&
    sameHex(event.emitter, gateway.registry.contractAddress) &&
    sameHex(event.owner, card.owner.address) &&
    sameHex(event.owner, card.allowedWallet) &&
    event.nickname === card.owner.nickname
  );
}

export async function getCard({
  cardId,
  gateway,
}: {
  cardId: CardId;
  gateway: RegistrationGateway;
}): Promise<Card> {
  const card = await requireCard(gateway, cardId);
  if (card.cardId !== cardId || (gateway.mode !== "live" && gateway.registry.chainId !== sample.chainId)) {
    throw new ApiError(503, "UPSTREAM_UNAVAILABLE", "Gateway returned an invalid card");
  }
  const common = {
    cardId: card.cardId,
    playerName: card.playerName,
    registry: gateway.registry,
  };
  if (card.kind === "unregistered") {
    return { ...common, status: "unregistered", owner: null, evidence: { status: "none" } };
  }

  const event = await gateway.findRegistrationEvent(cardId);
  const evidence = event && eventMatchesCard(event, card, gateway)
    ? { status: "available" as const, transactionHash: event.transactionHash, blockNumber: event.blockNumber }
    : { status: "pending" as const };
  return { ...common, status: "registered", owner: card.owner, evidence };
}

export async function prepareRegistration({
  cardId,
  input,
  gateway,
}: {
  cardId: CardId;
  input: PrepareInput;
  gateway: RegistrationGateway;
}): Promise<PreparedRegistration> {
  const card = await requireCard(gateway, cardId);
  if (card.cardId !== cardId || (gateway.mode !== "live" && gateway.registry.chainId !== sample.chainId)) {
    throw new ApiError(503, "UPSTREAM_UNAVAILABLE", "Gateway returned an invalid card");
  }
  if (card.kind === "registered") {
    throw new ApiError(409, "ALREADY_REGISTERED", "Card already registered");
  }
  if (input.chainId !== gateway.registry.chainId) {
    throw new ApiError(422, "CHAIN_MISMATCH", "Wrong chain");
  }
  if (!sameHex(input.walletAddress, card.allowedWallet)) {
    throw new ApiError(422, "WALLET_NOT_ALLOWED", "Wallet not allowed");
  }
  if (gateway.mode !== "live" && input.nickname !== sample.nickname) {
    throw new ApiError(422, "MOCK_SAMPLE_UNSUPPORTED", "Only the sample nickname is available");
  }
  const transaction = await gateway.buildRegistrationTransaction({
    cardId,
    walletAddress: input.walletAddress.toLowerCase(),
    nickname: input.nickname,
  });
  if (
    transaction.chainId !== gateway.registry.chainId ||
    !sameHex(transaction.from, input.walletAddress) ||
    !sameHex(transaction.to, gateway.registry.contractAddress) ||
    transaction.value !== "0"
  ) {
    throw new ApiError(503, "UPSTREAM_UNAVAILABLE", "Gateway returned an invalid transaction");
  }
  return { cardId, nickname: input.nickname, transaction };
}

export async function getRegistrationTransaction({
  cardId,
  txHash,
  gateway,
}: {
  cardId: CardId;
  txHash: TransactionHash;
  gateway: RegistrationGateway;
}): Promise<RegistrationTransaction> {
  const card = await requireCard(gateway, cardId);
  const unknown = (reason: "TRANSACTION_NOT_SEEN" | "RECORD_MISMATCH"): RegistrationTransaction => ({
    cardId,
    transactionHash: txHash.toLowerCase(),
    status: "unknown",
    reason,
  });
  if (card.cardId !== cardId || (gateway.mode !== "live" && gateway.registry.chainId !== sample.chainId)) {
    return unknown("RECORD_MISMATCH");
  }
  const transaction = await gateway.getTransaction(txHash);
  if (transaction === null) {
    return unknown("TRANSACTION_NOT_SEEN");
  }
  if (
    !sameHex(transaction.hash, txHash) ||
    transaction.chainId !== gateway.registry.chainId ||
    !sameHex(transaction.to, gateway.registry.contractAddress) ||
    !sameHex(transaction.from, card.allowedWallet)
  ) {
    return unknown("RECORD_MISMATCH");
  }
  if (gateway.mode === "live" && (
    !transaction.registration || transaction.registration.cardId !== cardId ||
    (card.kind === "registered" && transaction.registration.nickname !== card.owner.nickname)
  )) return unknown("RECORD_MISMATCH");
  if (transaction.pending === true) {
    return { cardId, transactionHash: txHash.toLowerCase(), status: "pending" };
  }
  const receipt = await gateway.getReceipt(txHash);
  if (receipt === null) {
    return { cardId, transactionHash: txHash.toLowerCase(), status: "pending" };
  }
  if (!sameHex(receipt.transactionHash, txHash) || receipt.canonical === false) {
    return unknown("RECORD_MISMATCH");
  }
  if (receipt.status === "reverted") {
    return { cardId, transactionHash: txHash.toLowerCase(), status: "reverted" };
  }
  if (card.kind !== "registered") {
    return unknown("RECORD_MISMATCH");
  }
  const event = receipt.events.find((item) =>
    sameHex(item.transactionHash, txHash) &&
    item.blockNumber === receipt.blockNumber &&
    eventMatchesCard(item, card, gateway),
  );
  if (!event) {
    return unknown("RECORD_MISMATCH");
  }
  return {
    cardId,
    transactionHash: txHash.toLowerCase(),
    status: "confirmed",
    owner: card.owner,
    blockNumber: receipt.blockNumber,
  };
}
