English | [日本語](proposal.ja.md)

# Proposal

## Why
Search cards registered to a wallet by ENS name or address and show the connected wallet's verified Primary name. Add real integration for ENSv2 Continuity while preserving existing QR-first operations.

## What Changes
- Use ENS optionally for search and name display. Make new issuance unrestricted and remove the old CLI recipient-restriction options.
- Add a Web card list by ENS name or address, links to existing details, and Primary name display after forward-resolution verification.
- Add Sepolia ENSv2 resolution and owner-filtered Curvegrid event search.
- Do not acquire a parent name, create per-card subnames, or deploy new ENS contracts.

## Capabilities
### New Capabilities
- `ens-wallet-card-search`: Optional ENS and address search and verified Primary name display, without restricting the registration wallet.
### Modified Capabilities
None. Existing registration requirements remain.

## Impact
Contracts CLI, apps/web API and OpenAPI, mobile-ui, specifications, and submission materials. No migration of existing contracts or cards. Private keys remain on the CLI host.
