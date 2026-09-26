English | [日本語](proposal.ja.md)

# Proposal

## Why

The current API is a fixed mock and cannot verify MultiBaas, signatures, or chain records. Review the detailed API, contract, and issuer CLI design first, to test a real Curvegrid Testnet connection at a URL separate from UI development.

## What Changes

- Design a live Gateway and connection-check API in `apps/web`, preserving existing mock behavior.
- Select the chain and contract through configuration and record a free-form nickname in the owner's transaction.
- Design a new one-time owner-registration contract with a fixed issuer and a deployment, issuance, and query CLI.
- Define the boundary between the API on a separate Worker and the UI owner's screens and MetaMask connection.
- Proceed through plan storage, Draft PR, detailed design, user approval, then implementation. Open a documentation-only PR first and add code after explicit design approval.

## Capabilities

### New Capabilities

- `curvegrid-registration-backend`: MultiBaas connectivity for Curvegrid Testnet, public reads, transaction preparation for owner registration, record comparison, issuer CLI, and deployment configuration.

### Modified Capabilities

None. `openspec list --specs` returns zero specifications. Preserve the implemented mock contract in existing `specs/` and define approved changes in this change.

## Impact

The [plan](../../../specs/CURVEGRID_INTEGRATION_PLAN.md) and [detailed design](../../../specs/CURVEGRID_INTEGRATION_DESIGN.md) hold the design text. Future code targets are `apps/web/src/backend`, API Route Handlers, OpenAPI, contracts and CLI, and Workers configuration. Browser screens and MetaMask SDK belong to the UI owner.

Replace the fixed Amoy 80002 setting with live deployment configuration without changing existing mock response values. Curvegrid Testnet does not count as satisfying the acceptance criterion for verification through an independent public RPC. Live values and API keys are not configured. Code implementation is approved. Merging and publication follow separate instructions.

## Additional instructions on 2026-09-26

The user requested API connectivity and signing in the latest main UI, with mock behavior retained through environment variables. Add browser implementation to this PR within the [UI connection plan](../../../specs/UI_LIVE_CONNECTION_PLAN.md). UI design continues in parallel, and the existing public mock remains.

Correction on 2026-09-26: change the demo to unrestricted first registration by any wallet owner. Add error request IDs and diagnostic copying, and measure behavior against a new registry without modifying existing records.
