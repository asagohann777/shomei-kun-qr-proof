import { sample, scenarios } from "../generated/fixtures";
import {
  GatewayUnavailableError,
  sameHex,
  type CardId,
  type CardRecord,
  type ChainTransaction,
  type RegistrationEvent,
  type RegistrationGateway,
  type TransactionHash,
  type TransactionReceipt,
  type UnsignedTransaction,
} from "./domain";

export type MockOperation = keyof typeof scenarios;

export function isMockScenario(operation: MockOperation, value: string): boolean {
  return Object.hasOwn(scenarios[operation], value);
}

export function createMockGateway({
  operation,
  scenario,
}: {
  operation: MockOperation;
  scenario: string;
}): RegistrationGateway {
  const registry = {
    chainId: sample.chainId,
    contractAddress: sample.contractAddress,
    issuer: sample.issuer,
  };
  const owner = { address: sample.walletAddress, nickname: sample.nickname };
  const event: RegistrationEvent = {
    emitter: sample.contractAddress,
    cardId: sample.cardId,
    owner: sample.walletAddress,
    nickname: sample.nickname,
    transactionHash: sample.transactionHash,
    blockNumber: sample.blockNumber,
  };

  function available(cardId: CardId): boolean {
    if (cardId !== sample.cardId || scenario === "not-found") return false;
    if (scenario === "unavailable") throw new GatewayUnavailableError();
    return true;
  }

  function cardRecord(cardId: CardId): CardRecord | null {
    if (!available(cardId)) return null;
    const common = {
      cardId: sample.cardId,
      playerName: sample.playerName,
      allowedWallet: sample.walletAddress,
    };
    if (scenario === "unregistered" || (operation === "prepareRegistration" && scenario === "default")) {
      return { ...common, kind: "unregistered" };
    }
    return { ...common, kind: "registered", owner };
  }

  return {
    registry,
    async readCard(cardId) {
      return cardRecord(cardId);
    },
    async buildRegistrationTransaction({ cardId, walletAddress }: { cardId: CardId; walletAddress: string; nickname: string }): Promise<UnsignedTransaction> {
      if (!available(cardId)) throw new GatewayUnavailableError();
      return {
        chainId: sample.chainId,
        from: walletAddress.toLowerCase(),
        to: sample.contractAddress,
        data: "0x",
        value: "0",
      };
    },
    async getTransaction(txHash): Promise<ChainTransaction | null> {
      if (scenario === "unavailable") throw new GatewayUnavailableError();
      if (!sameHex(txHash, sample.transactionHash) || scenario === "unknown") return null;
      return {
        hash: sample.transactionHash,
        chainId: sample.chainId,
        from: scenario === "mismatch" ? "0x5555555555555555555555555555555555555555" : sample.walletAddress,
        to: sample.contractAddress,
      };
    },
    async getReceipt(txHash): Promise<TransactionReceipt | null> {
      if (scenario === "unavailable") throw new GatewayUnavailableError();
      if (!sameHex(txHash, sample.transactionHash) || scenario === "pending") return null;
      return {
        transactionHash: sample.transactionHash,
        status: scenario === "reverted" ? "reverted" : "success",
        blockNumber: sample.blockNumber,
        events: scenario === "reverted" ? [] : [event],
      };
    },
    async findRegistrationEvent(cardId): Promise<RegistrationEvent | null> {
      if (!available(cardId)) return null;
      return scenario === "evidence-pending" ? null : event;
    },
  };
}
