// SPDX-License-Identifier: MIT
// Generated from specs/openapi.yaml. Run npm run generate.
import type { components } from "./api";

export function Address(value: unknown): value is components["schemas"]["Address"];
export function TransactionHash(value: unknown): value is components["schemas"]["TransactionHash"];
export function CardId(value: unknown): value is components["schemas"]["CardId"];
export function Meta(value: unknown): value is components["schemas"]["Meta"];
export function Owner(value: unknown): value is components["schemas"]["Owner"];
export function Registry(value: unknown): value is components["schemas"]["Registry"];
export function EvidenceAvailable(value: unknown): value is components["schemas"]["EvidenceAvailable"];
export function EvidencePending(value: unknown): value is components["schemas"]["EvidencePending"];
export function EvidenceNone(value: unknown): value is components["schemas"]["EvidenceNone"];
export function UnregisteredCard(value: unknown): value is components["schemas"]["UnregisteredCard"];
export function RegisteredCard(value: unknown): value is components["schemas"]["RegisteredCard"];
export function PrepareRequest(value: unknown): value is components["schemas"]["PrepareRequest"];
export function UnsignedTransaction(value: unknown): value is components["schemas"]["UnsignedTransaction"];
export function PreparedRegistration(value: unknown): value is components["schemas"]["PreparedRegistration"];
export function PendingTransaction(value: unknown): value is components["schemas"]["PendingTransaction"];
export function ConfirmedTransaction(value: unknown): value is components["schemas"]["ConfirmedTransaction"];
export function RevertedTransaction(value: unknown): value is components["schemas"]["RevertedTransaction"];
export function UnknownTransaction(value: unknown): value is components["schemas"]["UnknownTransaction"];
export function CardResponse(value: unknown): value is components["schemas"]["CardResponse"];
export function PrepareResponse(value: unknown): value is components["schemas"]["PrepareResponse"];
export function TransactionResponse(value: unknown): value is components["schemas"]["TransactionResponse"];
export function ErrorResponse(value: unknown): value is components["schemas"]["ErrorResponse"];
export function ConnectionResponse(value: unknown): value is components["schemas"]["ConnectionResponse"];
