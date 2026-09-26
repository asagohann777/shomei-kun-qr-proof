# Tasks

## 1. ENS recipient issuance
- [x] 1.1 Add optional resolver and CLI confirmation/recheck/resume compatibility; verify CLI and issuer tests and document commands.

## 2. ENS registration search API
- [x] 2.1 Add typed OpenAPI endpoint, address-filtered scanning and receipt/state verification; test paging, changed names, reorgs, errors and empty results; document API.

## 3. Web search
- [x] 3.1 Add optional Japanese/English ENS search and existing detail links; test UI state, pagination, escaping and QR compatibility; document usage.

## 4. Integration and delivery
- [x] 4.1 Run contract/API/UI regression tests, type checks, builds and browser scenarios; record results in development log.
- [ ] 4.2 Verify live Sepolia ENSv2 resolution, restricted issuance and wallet search on a separate Worker, then verify iPhone and publish the integrated demo; document evidence and remaining limits.

Deployment resumed after explicit urgent approval. Validation and integration Workers now pass real ENS/primary-name/address lookup and browser navigation. Restricted issuance is verified on-chain at block 19313. The user confirmed PC Chrome + MetaMask operation. Physical iPhone verification remains outstanding.

## 5. Connected wallet primary name (user scope addition)
- [x] 5.1 Add Sepolia reverse lookup with forward-match verification and optional API response; test absent, mismatch and failure fallback.
- [x] 5.2 Show verified name with secondary address during registration, discard stale names on wallet change, and support both mock states. Verify real shomeikun.eth reverse resolution and browser behavior.

## 6. Direct wallet search and UI copy
- [x] 6.1 Accept an address in the same search input, skip ENS resolution and return address-filtered registrations; verify without ENS configuration.
- [x] 6.2 Update home/input text and remove the in-screen mock primary-name toggle while retaining dedicated preview URLs.
