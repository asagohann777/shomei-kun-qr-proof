English | [日本語](ARCHITECTURE.ja.md)

# Architecture and data flow

## Components

```text
Card QR → Mobile UI → Next.js API → MultiBaas → Curvegrid Testnet
                 └→ MetaMask ──user signature/submission──→ Public Web3 RPC
Issuer CLI ──unsigned transaction preparation──→ MultiBaas
          └──issuer signature/submission──→ Public Web3 RPC
```

| Component | Implementation and role |
| --- | --- |
| Mobile UI | `prototypes/mobile-ui`. JavaScript, Tailwind CSS, and daisyUI. Cards, camera, Japanese/English switching, and wallet operations |
| Web API | `apps/web`. Next.js and TypeScript. Validates MultiBaas responses, prepares unsigned transactions, and verifies registration results |
| Hosting | Cloudflare Workers and OpenNext. Integration serves the UI at `/ui/` and the API at `/api/v1/` |
| Contract | `contracts/src/OwnershipRegistry.sol`. Issuance permissions, first registration, and owner/nickname storage |
| Issuer CLI | `contracts`. Deployment, MultiBaas linking, card issuance, and record verification |
| MultiBaas | State reads, unsigned transaction creation, and receipt/event retrieval |
| ENS | ethers 6.17.0 resolves and reverse-resolves ENSv2 on Sepolia. It is separate from the registration chain, where addresses remain authoritative |
| MetaMask | Holds the registrant's key and signs/sends transactions |

There is no connection to the existing PoC's code, data, or storage. The current integration uses Curvegrid Testnet, chain ID `2017072401`. API configuration selects the contract. MultiBaas, RPC, and wallet chains must match.

## Data and permissions

A card is identified by its chain ID, contract address, and card ID. The chain is authoritative for existence, registration permission, owner, and nickname.

The issuer is fixed when the contract is deployed. A zero allowed wallet permits everyone; a specific address allows only that wallet to register. The CLI defaults to unrestricted issuance. The owner and nickname cannot change after registration.

Nicknames contain 1–96 UTF-8 bytes. The API does not normalize input and checks that ABI arguments match the submitted content. Browser storage alone never establishes registration.

## API

| Operation | Endpoint |
| --- | --- |
| Connection settings and status | `GET /api/v1/connection` |
| Public card information | `GET /api/v1/cards/{cardId}` |
| Unsigned registration transaction | `POST /api/v1/cards/{cardId}/registration/prepare` |
| Card search | `GET /api/v1/ens/cards?name={ENS name or address}` |
| Primary name display | `GET /api/v1/ens/primary-name?address={address}` |
| Registration transaction verification | `GET /api/v1/cards/{cardId}/transactions/{hash}` |

[openapi.yaml](openapi.yaml) defines bodies, responses, and errors. Unissued cards return 404, invalid input returns 400/413/422, and configuration/upstream failures return 503. Confirmed insufficient balance returns 422 `INSUFFICIENT_FUNDS`.

## Registration flow

1. Read the card and connection settings from the API.
2. Connect the user's wallet and add or switch networks when necessary.
3. After publication consent, the API prepares an unsigned transaction with MultiBaas.
4. The API and UI verify the chain, sender, recipient, value, card ID, and nickname.
5. MetaMask signs and submits to the public Web3 RPC.
6. The API compares the transaction, receipt, registration event, and current owner/nickname.

External browsers on iPhone/iPad open MetaMask's browser with `metamask://dapp/<public URL>?cardId=...`. Use an injected provider when available, otherwise MetaMask Connect. Do not force the target chain on the SDK's initial connection. Add or switch after connecting.

Save submission results per card, chain, and contract. Prevent repeated taps and other tabs from sending duplicates. Reopening only resumes queries of the existing transaction. The contract provides the final rejection of duplicate registrations.

## State and refresh

Manage connection preparation, registration transactions, and evidence refresh separately. Preserve the card and inputs during connection updates. After registration, update only the status area during refresh.

Verify the initial registration for up to 60 seconds. If transaction success and the owner match but event indexing is delayed, show registration completion separately from pending evidence. Never convert a network failure into unregistered or success.

## Camera

`qr-scanner` analyzes video and photos on the device. Bundle its decoder worker on the same origin. Allow camera permissions and required blobs only in live camera mode. Stop streams on navigation, page hiding, and successful reads. See [camera requirements](CAMERA_SCAN.md).

## Modes and secrets

Set `UI_API_MODE`, `UI_WALLET_MODE`, and `UI_CAMERA_MODE` at build time. The API's `BACKEND_MODE` is a runtime setting. Deploy the UI mock and integration to separate Workers.

Store the MultiBaas application key in a Cloudflare Secret. Keep the admin key and issuer signing key on the CLI side. Never retrieve the registrant's key from MetaMask. Public Web3 RPC settings are for wallet connections and never reuse an admin API key.

Add CORS only for permitted origins. Do not expose upstream error bodies or credentials. Use error codes and request IDs for diagnosis.

See [CURVEGRID_INTEGRATION_RUNBOOK.md](CURVEGRID_INTEGRATION_RUNBOOK.md) for configuration, builds, and operations, and [contracts/README.md](../contracts/README.md) for the contract and CLI.

## ENS reads and card search

Resolve ENS names on Sepolia, then filter Curvegrid Testnet `CardRegistered` events by owner. Each range covers at most 2,000 blocks. Each request scans at most four ranges and returns 20 records. Verify transactions, receipts, and current card state before returning the list. Cursors retain the search name, address, registry, and snapshot block hash. Changed targets or snapshot hashes require a fresh search. Address input skips ENS resolution.

Reverse lookup on the registration screen is optional display assistance. Return a name only after matching forward resolution, otherwise null. Clear the old name immediately on account changes and discard stale responses. Keep API keys and ENS RPC settings in Worker runtime Secrets, out of the browser. Handle CCIP/RPC redirects manually and reject 3xx responses.

Issue new cards with zero-address `allowedWallet`, without recipient restrictions. ENS is used only for search and name display. Removal of the current CLI's old `--recipient-ens` / `--wallet` options is planned. This specification update did not change code. Preserve existing restrictions, signed transactions, and historical state files for verification. Do not add per-card subnames, a new Registry/Resolver, or a persistent search index. See [details](ENS_INTEGRATION.md).
