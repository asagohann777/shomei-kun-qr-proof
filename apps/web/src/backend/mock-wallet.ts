// SPDX-License-Identifier: MIT
import { sample } from "../generated/fixtures";
import type { components } from "../generated/api";
import type { RegistrationTransaction, TransactionHash } from "./domain";

type PrepareResponse = components["schemas"]["PrepareResponse"];

export type MockWalletResult =
  | { status: "rejected" }
  | { status: "submitted"; transactionHash: TransactionHash };

export async function submitWithMockWallet({
  prepared,
  approve,
}: {
  prepared: PrepareResponse;
  approve: () => Promise<boolean>;
}): Promise<MockWalletResult> {
  if (
    prepared.meta.mode !== "mock" ||
    prepared.data.cardId !== sample.cardId ||
    prepared.data.nickname !== sample.nickname ||
    prepared.data.transaction.chainId !== sample.chainId ||
    prepared.data.transaction.from.toLowerCase() !== sample.walletAddress ||
    prepared.data.transaction.to.toLowerCase() !== sample.contractAddress ||
    prepared.data.transaction.data !== "0x" ||
    prepared.data.transaction.value !== "0"
  ) {
    throw new Error("Invalid mock transaction");
  }
  if (!(await approve())) return { status: "rejected" };
  return { status: "submitted", transactionHash: sample.transactionHash };
}

export async function runMockRegistration({
  prepared,
  approve,
  verify,
}: {
  prepared: PrepareResponse;
  approve: () => Promise<boolean>;
  verify: (transactionHash: TransactionHash) => Promise<RegistrationTransaction>;
}): Promise<{ status: "rejected" } | { status: "checked"; transaction: RegistrationTransaction }> {
  const submission = await submitWithMockWallet({ prepared, approve });
  if (submission.status === "rejected") return submission;
  const transaction = await verify(submission.transactionHash);
  return { status: "checked", transaction };
}
