English | [日本語](design.ja.md)

# Design

Correction on 2026-09-26: demo registration is open to everyone. When omitted in the CLI, allowedWallet=0 permits first registration by any wallet owner. References below to a specified allowed wallet apply only to restricted cards with a nonzero value. See the [open-registration plan](../../../specs/OPEN_REGISTRATION_DEMO.md) for current deployment and verification.

## Context

See the [proposal](proposal.md) for background. The API currently supports only mock mode and returns a fixed Amoy chain ID. Live settings have not been provided. Another owner is developing the UI in parallel.

The [detailed design](../../../specs/CURVEGRID_INTEGRATION_DESIGN.md) is authoritative for API formats, ABI, configuration, errors, CLI procedures, and test conditions. This document records architectural decisions. The user approved implementation in the same PR as detailed design `453387e`. The detailed design links to the approval source.

## Goals / Non-Goals

**Goals:**

- Validate external input and upstream responses at HTTP and Gateway boundaries, and evaluate registration conditions in the Service.
- Prepare transactions through MultiBaas and verify owner-wallet signatures against chain records.
- Provide an API contract and dedicated URL that the UI can use independently.

**Non-Goals:**

- Real-camera implementation. Additional instructions brought browser API and MetaMask connectivity into scope.
- Registration cancellation, ownership transfer, or migration of the existing service.
- Claiming that Curvegrid Testnet satisfies Amoy public-chain verification conditions.

## Decisions

1. Add a live Gateway to the existing Service. This reuses contract tests for the three existing APIs, unlike creating a separate API app. Live mode has no mock fallback.
2. Use MultiBaas REST API for reads and unsigned transaction construction. The registrant signs in MetaMask; the server does not sign on the user's behalf. Only the issuer CLI uses a local encrypted keystore.
3. Deploy a one-time registration contract with a fixed issuer. Updatable administration is unnecessary for the current permissions, so it is not added. ID and allowed wallet are fixed at issuance.
4. Propose nicknames of 1–96 UTF-8 bytes. Do not change the approved string through normalization or trimming. This does not prove a real name or uniqueness.
5. Compare transaction input, receipt logs, and current state. Relying only on the event index could mistake indexing delay for an unregistered card, so separate registration state from evidence availability.
6. Use a dedicated Worker and explicit CORS allowlist. Changing the same UI URL would affect parallel development, so that option is rejected. API responsibilities follow section 2 of the detailed design.
7. Save the signed transaction and progress before sending from the issuance CLI. Creating a new transaction on rerun risks duplicate submission, so allow only checking the same hash and explicitly resending the same transaction.

## Risks / Trade-offs

- Actual MultiBaas ABI response formats and permissions remain unverified. After configuration, capture sanitized fixtures and define accepted formats through contract tests.
- Event indexing can lag. Preserve registration state and mark only evidence as pending. Search communication failures return 503.
- Mobile connections may drop before returning from the wallet. Resume confirmation when a hash exists; otherwise show an unknown submission result and prevent automatic resubmission. The UI owner implements the screens.
- Curvegrid Testnet reads depend on the same infrastructure. The independent-public-RPC acceptance condition remains unmet.
- Registration cannot be changed. Use test cards and a separate deployment or new card when changes are needed.

## Migration Plan

After human review of the detailed design, define and share ABI, DTOs, and fixtures with the UI owner first. Implement contracts, CLI, Gateway, and API, then run existing mock and new contract tests. Check actual responses after configuration is provided.

Deploy and publish only under separate instructions for those actions. After publishing the dedicated Worker, record real API and smartphone integration tests. On failure, roll the Worker back to its previous version. Do not delete chain records. Migration to Amoy uses a separate deployment.

## Additional UI connection design

The [UI connection plan](../../../specs/UI_LIVE_CONNECTION_PLAN.md) governs the latest instructions, states, modes, and responsibilities. Default to mock/mock, make live/mock read-only, and use owner signatures in live/metamask. Reject mock/metamask.
