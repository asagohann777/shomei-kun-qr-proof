English | [日本語](PLAN.ja.md)

# Adopted plan: specifications for QR-based registered-owner lookup

Status: manually preserved record of the plan adopted on 2026-09-25 and its later revisions. This is not automatic capture of AI answers by the hook. The initial Curvegrid Testnet/RPC design changed to a MultiBaas API/Polygon Amoy design after additional instructions that day.

Approval of the initial plan covered documentation. Application implementation, commits, push, submission, and deployment were outside that task. Current requirements are in [SPEC.md](SPEC.md), architecture in [ARCHITECTURE.md](ARCHITECTURE.md), and results in [HACKATHON_CHANGES.md](HACKATHON_CHANGES.md).

## Additional adopted plan: mobile UI mock

A later UI request and execution instruction added an interactive portrait-phone mock. The choices were four screens including QR scanning, daisyUI and Tailwind CSS, and a public preview. Scope, decisions, and checks are recorded in [UI_MOCK_PLAN.md](UI_MOCK_PLAN.md). References to documentation-only work below describe the scope at that time.

## Revision at that time: MultiBaas API and Polygon Amoy

The [additional user instruction](../docs/prompts/2026-09-25/124238-516565-940307cad70d42acbdf9ec9f2ebda8bc.json) established the following direction. The initial plan below remains as history; this revision supersedes conflicting parts at that stage.

- Use Polygon Amoy, chain ID 80002, with test POL for gas.
- The application server and issuer CLI use MultiBaas APIs for state reads, unsigned transaction preparation, receipts, and events.
- Registrants sign in MetaMask; the issuer signs through the CLI. Both submit to Amoy. MultiBaas does not sign on users' behalf.
- Store a least-privilege application API key in a server-side Cloudflare Secret. Normal browser reads go through the application.
- Third parties verify through an Amoy RPC independent of MultiBaas and Amoy Polygonscan. Public screens link to transaction and contract pages.
- Do not translate API failures or event-indexing delays into an unregistered state. Verify Amoy MultiBaas availability, permissions, and synchronization before implementation.

This revision also covered documentation only. Separation from the existing PoC, mobile registration, on-chain nicknames, one-time registration, and Japanese/English display remain in scope.

## Initial purpose and deliverables

Define an additional-feature demo based on Shomei-kun that runs entirely from this repository.

- Document background, separation from existing features, roles, F01–F10, screens, and acceptance criteria.
- Document architecture, registration and viewing flows, public data, permissions, and technology choices.
- Update pre-existing-work and change records with sources, human decisions, and the scope of AI research and writing.
- Add demo instructions for preparation, mobile operation, and third-party verification.
- Save the adopted plan under `specs/` and manually preserve selected answers that were not automatically captured, with provenance.

## Initial agreed requirements

- The issuer uses a CLI to issue card IDs with allowed registration wallets. Distinguish issuance from completed owner registration.
- Accept only transactions signed by the allowed wallet. Record the owner and nickname on-chain in the same transaction. The contract rejects duplicate registration and overwrites.
- Nicknames are public and cannot be edited or deleted after registration. Explain the public fields during confirmation.
- The QR contains the public record URL. Identify a card by chain, contract, and card ID.
- "Current registered owner" means the owner in the registration record. Detecting QR copies or proving physical authenticity or possession is outside scope.
- Ownership transfers, registration cancellation, and data integration with the existing PoC are outside scope.
- Combine card confirmation and public viewing as states of one page. Together with registration input and registration processing, there are three screen types. Use the fictional player Shomei Ichiro and the demo nickname Ojiichan Konbini.
- Prefer the saved language choice. Otherwise choose the first Japanese or English match in browser preference order, defaulting to English. Do not translate nicknames.

## Initial architecture and interfaces

- Run Next.js and TypeScript on Cloudflare Workers. Record OpenNext, which uses Next.js's own build, as the proposed adapter.
- Focus registration on phones, using MetaMask Connect to connect a normal browser to the MetaMask app.
- Deploy a registration contract on Curvegrid Testnet. Its minimum interface includes issuance, self-registration, public reads, and issuance/registration events.
- Fix the allowed wallet at issuance. Do not add administrator rewrites of registered data or contract upgrades.
- Allow viewing without a wallet connection. Chain state is authoritative for the owner; obtain the registration transaction from events.
- Separate public Web3 connection settings from management credentials. Keep the issuer signing key on the CLI side. The app does not handle users' private keys.
- Display chain ID, contract, card ID, issuer, and registration transaction hash as evidence. Provide direct public-RPC verification steps. A public explorer is not required in this initial version.

## Initial acceptance criteria and unresolved items

Map tests for valid issuance, duplicate IDs, unissued IDs, unauthorized issuance, disallowed wallets, wrong chains, duplicate registration, and overwrites to requirement IDs. Verify scanning a QR on a phone, registering in MetaMask, and checking the same record from another device without a connected wallet.

Distinguish approval pending, submitted, record verification, success, rejection/failure, and unknown outcomes. Do not display success before matching a successful receipt to the record. Re-query the chain after reload or app return; do not automatically resend.

Check Japanese/English switching and persistence, desktop/390px/320px layouts, and wallet round trips on a physical phone. Verify that a third party can carry out the independent verification procedure.

Fill in the actual MultiBaas environment, chain ID, RPC, contract, and public URL after checking the environment. Leave the OSS license, asset permissions, entry track, and alignment with the hackathon period unconfirmed until established. Record test results after execution, not as successes at the planning stage.

## Conversation references

### 2026-09-26 JST: detailed Web API design

The adopted scope uses fixed mocks for MultiBaas, signing, and submission. It stores no state and accepts sample registration input only. The issuer CLI is deferred.

Deliverables are [BACKEND_DESIGN.md](BACKEND_DESIGN.md) and [openapi.yaml](openapi.yaml). Define inputs, outputs, errors, scenarios, verification conditions, and live-migration conditions for card retrieval, registration preparation, and registration confirmation. A static checker compares OpenAPI with response examples. API server implementation and connection to the existing UI are outside this task.

The detailed design records implementation tests B01–B11. Static checks do not count as successful live tests. Preserve [selected answers and provenance](../docs/prompts/backend-design-decisions.md).

### Initial references

- [Initial request](../docs/prompts/2026-09-25/121716-439190-2cd0d9f92aa8468588e7978b39382568.json)
- [Correction to mobile registration](../docs/prompts/2026-09-25/122429-037897-c475cb8e8fd244c08302e2043f25f922.json)
- [Instruction to execute the plan](../docs/prompts/2026-09-25/122651-114438-1fe83e01648547c1a4e98d4f8cc0ec12.json)
- [Manually recorded multiple-choice questions and answers](../docs/prompts/qr-proof-decisions.md)

## 2026-09-26 JST: implementation based on the detailed design

The [user's implementation instruction](../docs/prompts/2026-09-25/152556-790938-5fdac443e5ab4602b26eb512cec3edb6.json) adds the fixed mock Web API in `apps/web/`. Save responsibilities, steps, and results in the [implementation and verification record](BACKEND_IMPLEMENTATION.md). Integration with the existing UI, real wallets, live MultiBaas/Amoy, and publication are excluded at this stage.
