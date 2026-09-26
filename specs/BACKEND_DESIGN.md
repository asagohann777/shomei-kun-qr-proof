English | [日本語](BACKEND_DESIGN.ja.md)

# Detailed Web API design using fixed mocks

Status: design elaborating the plan adopted on 2026-09-26 JST. The fixed mock API, Gateway, and Mock Wallet operation library were implemented in `apps/web/`. Live integration had not been implemented at this stage. [openapi.yaml](openapi.yaml) is the API contract source of truth. The existing static UI mock does not call this API in this design.

## Adopted scope

Define three APIs for card retrieval, registration preparation, and registration confirmation using Next.js, TypeScript, and Cloudflare Workers. Mock MultiBaas connections, wallet signing, and submission to Amoy. Return fixed samples without a database, sessions, persisted registration results, or state changes based on call counts. Defer the issuer CLI.

The user selected "mock signing and submission too," "return fixed samples only," "design the Web API first," and "use fixed sample inputs." The initial deliverables were this document and OpenAPI. A later implementation instruction added the fixed mock API. See the [implementation and verification record](BACKEND_IMPLEMENTATION.md). No publication occurred in that task, and there is no connection to the existing PoC.

## Components and responsibilities

```text
UI --> Route Handler --> Registration Service --> MultiBaas Gateway
                                                     |
                                                 Mock Gateway

UI --> Mock Wallet --> fixed transaction hash
```

| Component | Responsibility |
| --- | --- |
| Route Handler | Validate JSON, paths, and headers; call the Service; produce HTTP status and common response envelopes |
| Registration Service | Check card existence, registration conditions, and agreement between transactions and records; keep MultiBaas-specific JSON out of the UI |
| MultiBaas Gateway | Return shared internal representations for card reads, unsigned transactions, transaction/receipt retrieval, and registration-event queries |
| Mock Gateway | Return fixed scenario data or connection errors, without storing state |
| Mock Wallet | Return a fixed hash on approval or a rejection result, without calling a real wallet or RPC |

The Service performs the same verification in mock mode. In `mismatch`, the Gateway returns a sender different from the allowed wallet and the Service detects a record mismatch. The mock does not merely return complete preassembled HTTP responses.

Internal Gateway operations are `readCard(cardId)`, `buildRegistrationTransaction(cardId, walletAddress, nickname)`, `getTransaction(txHash)`, `getReceipt(txHash)`, and `findRegistrationEvent(cardId)`. Represent a nonexistent card, missing transaction, pending receipt, and pending event as distinct results. Treat network failures as a different connection-error type. Supply the scenario when constructing a Gateway for each request, not through a shared variable.

## Deployment and public boundary

One API deployment serves one registration contract. Identify cards by `chainId + contractAddress + cardId`. The path contains only the card ID; server settings determine chain and contract. Cards from another deployment use that deployment's API.

All APIs can be called without a connected wallet. The address supplied to registration preparation is not proof of identity. Permission checks in this mock only validate sample consistency. Live registration permissions are enforced by signatures and the contract. There is no Web API for issuance, owner updates, or signing on behalf of users.

Assume the UI and API share an origin. Do not accept arbitrary MultiBaas methods, RPC endpoints, contracts, or function names as input. Responses include `Cache-Control: no-store`. Additional directives such as `private` and `no-cache` are allowed, but `no-store` remains required. Do not return internal stacks or API keys.

Set `BACKEND_MODE=mock`. Missing or unknown modes are configuration errors. Never fall back to mock mode after a network failure. Reserve `live` in response formats, but reject it as a startup setting until the live Gateway is implemented and verified.

## API contract

| Method and path | Input | Successful response data |
| --- | --- | --- |
| `GET /api/v1/cards/{cardId}` | Card ID | Card, player name, deployment information, registration status, owner, and evidence |
| `POST /api/v1/cards/{cardId}/registration/prepare` | `walletAddress`, `chainId`, `nickname` | Card ID, nickname, and unsigned transaction |
| `GET /api/v1/cards/{cardId}/transactions/{txHash}` | Card ID and transaction hash | Transaction verification result for the card |

Success uses `{ meta, data }`; failure uses `{ meta, error: { code, message } }`. In this version, `meta.mode` is always `mock`. The UI selects Japanese or English text using `error.code`, not the English diagnostic `message`.

### Input rules

Card IDs contain 1–64 ASCII letters, digits, hyphens, or underscores. Addresses are `0x` followed by 40 hexadecimal digits; hashes are `0x` followed by 64 hexadecimal digits. Normalize hexadecimal portions to lowercase before comparison. Do not trim or Unicode-normalize nicknames; require an exact match with the fixed sample.

Registration-preparation JSON allows only the three required fields. Reject an empty nickname. Limit the body to 16 KiB and require `application/json`. Free-form nickname length, normalization, and on-chain limits belong to the live design. Do not reuse the sample constraint as a production nickname rule.

Mock validation order is format/size, scenario, fixed card existence, connection-error scenario, already-registered status, chain, allowed wallet, then sample nickname. In live mode, determine that a card is unissued only after a successful read; retrieval failures return 503. A well-formed unknown hash for an existing card returns HTTP 200 with `unknown / TRANSACTION_NOT_SEEN`.

### Cards and evidence

- `unregistered`: `owner` is null and `evidence.status` is `none`.
- `registered`: `owner` includes address and nickname; evidence is `available` or `pending`.
- `available`: includes a registration hash and block number. Do not invent an unverified hash for `pending` evidence.
- Unissued cards return 404 and are not included in `unregistered`. Card-read failures return 503.

### Unsigned transactions

The preparation response contains `chainId`, `from`, `to`, `data`, and `value`. `value` is a decimal string in wei, fixed to `"0"` for this operation. Nonce, gas, and fees are outside the API contract and are handled by the wallet in live mode.

The mock `data: "0x"` is a placeholder for an undefined ABI, not registration calldata. The UI routes `meta.mode=mock` to the Mock Wallet. Do not construct real transactions or Polygonscan links from mock values. Defining the ABI and generating calldata are prerequisites for live integration.

### Registration confirmation

| status | Condition |
| --- | --- |
| `pending` | The target transaction was retrieved, but no receipt is available yet |
| `confirmed` | The successful receipt, target transaction, registration event, and card state all match |
| `reverted` | The target transaction's receipt indicates failure |
| `unknown` | The transaction was not retrieved, or the associated records do not match |

Use `TRANSACTION_NOT_SEEN` when a successful query finds no transaction, and `RECORD_MISMATCH` when records disagree. Network failures return 503, distinct from these HTTP 200 results.

Confirmation requires chain ID 80002, the configured contract as transaction recipient, the allowed wallet as sender, and a receipt hash matching the queried hash. Match the card ID, owner, and nickname in the registration event emitted by the target contract in that receipt, then compare them with card state. A successful receipt alone is insufficient. A failed transaction to another contract is also a mismatch, not `reverted`, until its identity has been verified.

Delayed event indexing does not prevent confirmation if the event in the queried receipt provides verification. Treat delayed public-card evidence lookup separately and retain the retrieved owner. In the free-input live version, the UI also compares the approved values it retains with the confirmation API result. Do not send expected values to the API and treat those values themselves as evidence.

### Errors

| HTTP | code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_INPUT` | Invalid path, JSON, or type |
| 400 | `INVALID_MOCK_SCENARIO` | Unknown scenario or unsupported operation/scenario combination |
| 404 | `CARD_NOT_FOUND` | Unissued card |
| 409 | `ALREADY_REGISTERED` | Preparing registration for an already-registered card |
| 422 | `CHAIN_MISMATCH` | A chain other than Amoy was supplied |
| 422 | `WALLET_NOT_ALLOWED` | Wallet is not permitted |
| 422 | `MOCK_SAMPLE_UNSUPPORTED` | Nickname differs from the fixed sample |
| 413 | `PAYLOAD_TOO_LARGE` | Body exceeds the limit |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Non-JSON body |
| 503 | `UPSTREAM_UNAVAILABLE` | Simulated MultiBaas outage, timeout, authentication failure, or invalid response |
| 500 | `INTERNAL_ERROR` | Internal application defect |

Treat external connection failures as an unverifiable result that can be queried again. Reading again never automatically resends a transaction. Log error category and operation, not raw MultiBaas response bodies or secrets.

## Fixed samples and scenarios

Keep fixed values in OpenAPI's `x-mock-sample`. The card is `SK-2026-001`, player name is `証明一郎` (Shomei Ichiro), and nickname is `おじいちゃんコンビニ` (Ojiichan Konbini). Addresses, hashes, and block numbers are synthetic and do not claim to identify real-network records or people.

Select a scenario through the request's `X-Mock-Scenario` header; the default is `default`. Each operation's `x-mock-scenarios` is authoritative for supported combinations.

| Scenario | Card retrieval | Registration preparation | Registration confirmation |
| --- | --- | --- | --- |
| `default` | Registered | Success from an unregistered sample | Confirmed |
| `registered` | Registered | 409 | Confirmed |
| `unregistered` | Unregistered | Success | 400 |
| `not-found` | 404 | 404 | 404 |
| `pending` | 400 | 400 | Pending |
| `reverted` | 400 | 400 | Reverted transaction |
| `unknown` | 400 | 400 | Transaction not found |
| `evidence-pending` | Owner present; evidence pending | 400 | 400 |
| `unavailable` | 503 | 503 | 503 |
| `mismatch` | 400 | 400 | Record mismatch |

`default` is an independent successful example for each API, not shared state. Use explicit scenarios to exercise a sequence starting before registration. Reproduce disallowed-wallet and wrong-chain cases through preparation input. Reproduce rejected approval in Mock Wallet, not through an additional backend scenario.

After format and scenario validation, any unknown card returns 404. A known card with `not-found` also returns 404. Confirmation using a hash other than the known sample returns `TRANSACTION_NOT_SEEN`, except that `unavailable` returns 503. A scenario cannot make arbitrary hashes confirmed. Future live mode rejects the mock header itself with 400 instead of silently ignoring it.

## UI call sequence

1. Retrieve the card with `unregistered`.
2. Check the sample wallet, nickname, and consent to publication, then call preparation. Do not prepare before consent.
3. Approve through Mock Wallet. On rejection, stop without starting confirmation.
4. Query confirmation with the fixed hash and `pending`, then `registered`. The test controls this scenario switch.
5. Retrieve the card again with `registered`.

Reloads and requests from another device also return the selected scenario's fixed data. They do not share entered names or registration results. Free-form input and timer-based simulated success in the existing UI belong to a separate prototype. Connecting it to this API requires fixed sample input and explicit scenario changes.

## Conditions for live integration

Keep API paths and shared DTOs while replacing the Gateway and Wallet with live implementations. Translate MultiBaas response shapes inside the Gateway. Store the least-privilege API key in a server-side Secret and fix `signAndSubmit: false` for unsigned transaction preparation.

Before migration, verify the ABI, real addresses, issuer, deployment block, MultiBaas permissions and synchronization, actual transaction/receipt responses, and signing/app return on a phone. Fixed-response tests do not prove those checks passed. Define confirmation depth, reorganization handling, and operational limits in the live integration design.

References: [MultiBaas frontend and unsigned transactions](https://docs.curvegrid.com/multibaas/getting-started/build-a-frontend/), [contract function API](https://docs.curvegrid.com/multibaas/api/call-contract-function/), [transactions](https://docs.curvegrid.com/multibaas/api/get-transaction/), and [receipts](https://docs.curvegrid.com/multibaas/api/get-transaction-receipt/). Reviewed during design research on 2026-09-26 JST. No live environment was contacted in that research.

## Verification plan

| ID | Target and expected result |
| --- | --- |
| B01 | Unissued IDs return 404 and never create cards automatically |
| B02 | Registered cards return 409; disallowed wallets, wrong chains, and non-sample names return 422 |
| B03 | Repeated preparation does not change card retrieval for the same scenario |
| B04 | Concurrent scenarios do not affect other requests |
| B05 | Mismatched transaction recipient/sender, receipt hash/event emitter, card ID, owner, nickname, or state never becomes confirmed |
| B06 | Only a failed receipt for the target transaction is reverted; distinguish missing transactions, pending receipts, and network failures |
| B07 | Return the known owner while evidence is pending |
| B08 | Do not query confirmation after rejection or automatically resend unknown outcomes |
| B09 | Mocks never contact real wallets, external APIs, or RPCs |
| B10 | Reject invalid format, size, Content-Type, and scenarios as specified |
| B11 | Every response matches OpenAPI and identifies mock mode; mock headers cannot be used in live mode |

Implementation tests B01–B11 and their scope are recorded in the [implementation record](BACKEND_IMPLEMENTATION.md). The following static check validates only OpenAPI syntax, references, samples, and scenario tables.

Rerun it with:

```sh
python3 -m venv /tmp/shomei-openapi-venv
/tmp/shomei-openapi-venv/bin/pip install -r scripts/requirements-backend-spec.txt
/tmp/shomei-openapi-venv/bin/python scripts/verify_backend_spec.py
```

## Decision sources

- [Exploration request](../docs/prompts/2026-09-25/140109-789742-3fa35cc7e2b54786aaaa64a589110919.json)
- [Instruction to execute the adopted plan](../docs/prompts/2026-09-25/151125-676118-d1888c4c54d2401ea99965526e42e9fb.json)
- [Manual record of selected answers and scope](../docs/prompts/backend-design-decisions.md)

The JSON timestamps are 2026-09-25 UTC; the execution instruction is dated 2026-09-26 in JST. OpenSpec initialization was confirmed, but this stage's specifications reside under `specs/`. The initial approval covered the design artifacts above. The later [implementation instruction](../docs/prompts/2026-09-25/152556-790938-5fdac443e5ab4602b26eb512cec3edb6.json) added the fixed mock API. No OpenSpec change was created for that task.
