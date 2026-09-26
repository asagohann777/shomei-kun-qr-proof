English | [日本語](CURVEGRID_INTEGRATION_PLAN.ja.md)

# Curvegrid integration plan

Status: On 2026-09-26 JST, the detailed design and implementation in the same PR were approved. See the [change log](HACKATHON_CHANGES.md) for the plan-storage/design-review history.

[Detailed design](CURVEGRID_INTEGRATION_DESIGN.md) / [Draft PR #1](https://github.com/asagohann777/shomei-kun-qr-proof/pull/1)

## Objective

Provide a URL separate from UI review where users can test Curvegrid Testnet connectivity, card-owner registration with their own wallets, and rereading registrations. Extend the fixed mock API to a live connection centered on MultiBaas API. Implement in the same PR after design approval.

## Procedure

1. Create a dedicated worktree and `feat/curvegrid-integration-backend` branch. Keep the current checkout for the UI owner.
2. Save this plan and create a draft PR with a commit containing only the plan and source records.
3. Investigate missing implementation, save the detailed design in `specs/CURVEGRID_INTEGRATION_DESIGN.md`, and add it to the same PR.
4. Present the PR/design and wait for explicit user design approval. Before approval, change no implementation code, dependencies, or deployment configuration.
5. After approval, implement and verify the backend in the same branch/PR. Record the approved design commit. Follow separate instructions for merging.

## Ownership

| Owner | Scope |
| --- | --- |
| Backend | Live MultiBaas, Web API, owner-registration contract, issuer CLI, separate backend URL, tests, and setup instructions |
| UI | Screens, Japanese/English, MetaMask connection from ordinary browsers, signing, and return/recheck display |
| Joint review | API contract, wallet transactions, public network settings, and error/state meaning |

The UI owner also owns the simple screen at the separate URL. The backend owner does not implement screens or browser SDKs. Include input/output examples and connection steps for the UI owner in the detailed design. Update shared OpenAPI only after confirming the boundary in design review.

## Connection and registration direction

- The first live target is Curvegrid Testnet. The user has created the MultiBaas environment and will configure connection details later.
- The server uses MultiBaas for state reads, unsigned transactions, and transaction/receipt/event retrieval. Fix `signAndSubmit: false`.
- Connect an ordinary browser to MetaMask so users sign and submit themselves. Separate admin API credentials from public wallet Web3 RPC settings.
- Create a new owner-registration contract. Only the issuer issues card IDs and allowed wallets. Only the permitted wallet registers once. Provide no transfers, cancellation, or overwrites.
- Deployment/issuance use the CLI with a local encrypted keystore. Do not pass its signing key to the web app.
- Nicknames are free input. The proposed 1–96 UTF-8 bytes with no whitespace removal or Unicode normalization are to be confirmed in this review.
- Extend `apps/web/` and propose an independent Cloudflare Worker, `shomei-kun-integration`. Keep the existing UI mock URL.
- Preserve mock API examples/tests. Never automatically fall back to mock data after connection failure.

Amoy migration, independent third-party verification on a public chain, existing PoC integration, and changes to the existing UI mock are out of scope.

## Decisions for detailed design

| Area | Design contents |
| --- | --- |
| API/UI contract | Make the existing three APIs live; connection API, free input, chain settings, errors, CORS, and request/response examples |
| Gateway | MultiBaas APIs, response mapping, authentication/timeouts, event indexing delays, and transaction/registration verification |
| Contract | ABI, storage, issuance/registration events, permissions, input constraints, and duplicate/overwrite rejection |
| CLI | Deployment, ABI upload/linking, issuance, queries, reruns, and local signing keys |
| Wallet handoff | Unsigned transaction format/validation, Web3 settings, account/chain changes, rejection, and post-submission checks |
| Deployment/verification | Independent Worker, Secrets/public settings, missing-configuration behavior, tests, and completion criteria |

## OpenSpec

OpenSpec is initialized, but no change existed when this plan was saved. `openspec-update-change` edits existing artifacts, so first use `openspec-propose` to create `curvegrid-testnet-integration`. Use `openspec-update-change` for later design edits.

Keep the main text in `specs/` as required by repository rules. OpenSpec holds the proposal, requirements, design references, and incomplete tasks. Completed CLI artifacts do not mean user design approval.

## Completion criteria

At the design stage, make the plan, detailed design, API examples, UI ownership boundary, and implementation tasks reviewable in the PR. Validate document consistency without claiming implementation or live connectivity.

After approval, run existing mock tests, contract permission/duplicate-registration tests, Gateway failure tests, and Next.js/Workers HTTP tests. After configuration, verify the real environment at the dedicated URL and jointly test phone signing/return with the UI owner. Pre-configuration tests do not prove live connectivity.

## Sources

- [Curvegrid Testnet and separate URL request](../docs/prompts/2026-09-25/201954-608359-10ee560f85bf438a9719f628ceadc4b0.json)
- [Branch, PR, and design-review instruction](../docs/prompts/2026-09-25/202746-820949-ef57f69d6cb24768bc80b6fecc3446ef.json)
- [Instruction to execute this procedure](../docs/prompts/2026-09-25/203111-203270-0c1f2dbe99cc4e19af3fb1ab5528d7b4.json)
- [Manually recorded choices](../docs/prompts/curvegrid-integration-decisions.md)
