English | [日本語](design.ja.md)

# Design

## Context
The existing CLI supports a wallet option and storage and resumption of signed transactions. CardRegistered has an indexed owner; an owner-filtered eth_getLogs call against the real RPC retrieved existing records. Scanning every event through the existing MultiBaas GET /events would make list retrieval too costly.

## Goals / Non-Goals
Goals: optional ENS search and name display, verified lists by address, unrestricted new issuance, and compatibility with existing QR operations.
Non-Goals: ENS writes, parent-name or subname acquisition, Registry/Resolver deployment, transfers or sales, and asset lists across all networks.

## Decisions
- ENS_SEPOLIA_RPC_URL is optional API configuration for search and Primary name display. Use ethers ENSIP-15 normalization and the Sepolia Universal Resolver. Issuance and registration do not require ENS.
- New issue operations fix allowedWallet to the zero address. The old --recipient-ens / --wallet options are to be removed. Do not alter issued cards or saved signed transactions. Current code still has the old options; omit them until migration is complete.
- GET /api/v1/ens/cards?name=...&cursor=... resolves ENS for a new search and fixes a Curvegrid reference block/hash. Continuation resolves again; an address change returns 409 and requires a new search.
- Scan descending ranges of at most 2000 blocks. Each page contains at most twenty results; the cursor stores the reference hash, owner, and next block/log position. Split and retry upstream range-limit failures; failure on a single block returns 503. Return a cursor when the processing deadline leaves work incomplete.
- Verify event cardKey, owner, and emitter and return only records confirmed by existing transaction/receipt/card comparison. A mismatch returns 503 rather than silently omitting a record. Deduplicate card IDs and return 409 on reference-hash changes. Report zero cards only for a complete empty list.
- Keep QR as the primary UI action and ENS search secondary. Support Japanese and English and reads without a connected wallet. Distinguish loading, unresolved names, incomplete results, zero results, and failures. List entries open existing cardId details.

## Risks / Trade-offs
- Name changes: new searches follow the changed target; issued cards remain immutable.
- Two chain roles: ENS uses Sepolia and cards use Curvegrid. Registration works without ENS.
- Full-history search load: split ranges and use continuation. No database indexer is introduced here.
- ENS CCIP Read: public-only fetch rejects internal destinations and enforces timeouts.
- Submission: a demo using real ENSv2 records and public code and URLs are required. Code completion alone does not establish eligibility.

## Migration Plan
Generate OpenAPI outputs, run existing and new tests, deploy a separate validation Worker, then update the public deployment. Existing functions work without adding ENS configuration. Roll back to the previous Worker version if needed. Code, specifications, and prompts belong in Git; generated cards and secrets do not.

## Open Questions
Forward/reverse agreement for shomeikun.eth and live search are verified. The old card's unknown result after the iPhone app closed remains unresolved. Registration of a separate unrestricted card succeeded; this is distinct from a recovery fix.

## Primary name scope addition
The connected registration wallet is reverse-resolved on Sepolia through the existing ethers provider, then explicitly forward-checked. A separate optional display endpoint returns a nullable name. The browser keeps a generation counter per address, clears the previous name before starting a new lookup, and ignores stale completions. No registration, permission or stored-card field depends on this enrichment. Mock name-present/unset states are UI fixtures. ENS display and search do not restrict card recipients.
