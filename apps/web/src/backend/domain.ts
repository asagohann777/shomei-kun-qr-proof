import type { components } from "../generated/api";

export type CardId = components["schemas"]["CardId"];
export type Address = components["schemas"]["Address"];
export type TransactionHash = components["schemas"]["TransactionHash"];
export type Owner = components["schemas"]["Owner"];
export type Card = components["schemas"]["CardResponse"]["data"];
export type PrepareInput = components["schemas"]["PrepareRequest"];
export type PreparedRegistration = components["schemas"]["PreparedRegistration"];
export type UnsignedTransaction = components["schemas"]["UnsignedTransaction"];
export type RegistrationTransaction = components["schemas"]["TransactionResponse"]["data"];
export type Connection = components["schemas"]["ConnectionResponse"]["data"];

export type RegistrationEvent = {
  emitter: Address;
  cardId: CardId;
  owner: Address;
  nickname: string;
  transactionHash: TransactionHash;
  blockNumber: number;
};

export type CardRecord =
  | { kind: "unregistered"; cardId: CardId; playerName: string; allowedWallet: Address }
  | { kind: "registered"; cardId: CardId; playerName: string; allowedWallet: Address; owner: Owner };

export type ChainTransaction = {
  hash: TransactionHash;
  chainId: number;
  from: Address;
  to: Address;
  registration?: { cardId: CardId; nickname: string };
  pending?: boolean;
};

export type TransactionReceipt = {
  transactionHash: TransactionHash;
  status: "success" | "reverted";
  blockNumber: number;
  events: RegistrationEvent[];
  blockHash?: string;
  canonical?: boolean;
};

export interface RegistrationGateway {
  readonly mode?: "mock" | "live";
  checkConnection?(): Promise<Connection>;
  readonly registry: components["schemas"]["Registry"];
  readCard(cardId: CardId): Promise<CardRecord | null>;
  buildRegistrationTransaction(input: {
    cardId: CardId;
    walletAddress: Address;
    nickname: string;
  }): Promise<UnsignedTransaction>;
  getTransaction(txHash: TransactionHash): Promise<ChainTransaction | null>;
  getReceipt(txHash: TransactionHash): Promise<TransactionReceipt | null>;
  findRegistrationEvent(cardId: CardId): Promise<RegistrationEvent | null>;
}

export class GatewayUnavailableError extends Error {
  constructor() {
    super("Gateway unavailable");
    this.name = "GatewayUnavailableError";
  }
}

export type ApiErrorCode = components["schemas"]["ErrorResponse"]["error"]["code"];

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: { missingSettings: string[] },
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function sameHex(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

export function lowerHex(value: string): string {
  return value.toLowerCase();
}
