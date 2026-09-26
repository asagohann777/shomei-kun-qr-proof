# Tasks

## 1. Issuance scope correction
- [ ] 1.1 Remove recipient restriction options from new CLI issuance, issue with zero-address allowedWallet, preserve historical state and already-issued cards, and update CLI tests and usage documentation.

The previously completed ENS recipient implementation is superseded by the user's 2026-09-26 clarification. Old CLI options still exist. The replacement demo card was issued without either option.

## 2. ENS registration search API
- [x] 2.1 Add typed OpenAPI endpoint, address-filtered scanning and receipt/state verification; test paging, changed names, reorgs, errors and empty results; document API.

## 3. Web search
- [x] 3.1 Add optional Japanese/English ENS search and existing detail links; test UI state, pagination, escaping and QR compatibility; document usage.

## 4. Integration and delivery
- [x] 4.1 Run contract/API/UI regression tests, type checks, builds and browser scenarios; record results in development log.
- [ ] 4.2 Verify live Sepolia ENSv2 resolution, unrestricted issuance and wallet search on a separate Worker, then verify iPhone and publish the integrated demo; document evidence and remaining limits.

Deployment resumed after explicit urgent approval. Validation and integration Workers now pass real ENS/primary-name/address lookup and browser navigation. Historical restricted issuance was verified at block 19313. The user confirmed PC Chrome + MetaMask operation and subsequently reported successful registration of unrestricted demo-open-20260926-02 during the iPhone demo session. The public API confirms registration at block 19315. The previous card's crash recovery is unresolved; complete physical-device ENS verification is not claimed.

## 5. Connected wallet primary name (user scope addition)
- [x] 5.1 Add Sepolia reverse lookup with forward-match verification and optional API response; test absent, mismatch and failure fallback.
- [x] 5.2 Show verified name with secondary address during registration, discard stale names on wallet change, and support both mock states. Verify real shomeikun.eth reverse resolution and browser behavior.

## 6. Direct wallet search and UI copy
- [x] 6.1 Accept an address in the same search input, skip ENS resolution and return address-filtered registrations; verify without ENS configuration.
- [x] 6.2 Update home/input text and remove the in-screen mock primary-name toggle while retaining dedicated preview URLs.

## 7. Current documentation and deferred recovery
- [x] 7.1 Align the specifications and planning artifacts with optional ENS search/display, unrestricted issuance, successful demo registration and the five-card filming gallery.
- [ ] 7.2 Diagnose and verify recovery from the old iPhone unknown-attempt state. The user deferred this work to prioritize filming; do not clear or resend an uncertain transaction automatically.
