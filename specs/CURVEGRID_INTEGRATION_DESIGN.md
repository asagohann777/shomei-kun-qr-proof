English | [日本語](CURVEGRID_INTEGRATION_DESIGN.ja.md)

# Curvegrid Testnet integration design

Correction dated 2026-09-26: demo registration is open to everyone. When the CLI recipient option is omitted, issuance uses allowedWallet=0 and any user's wallet can perform the first registration. The designated-wallet restrictions below apply only to restricted cards issued with a nonzero address. See the [open registration plan](OPEN_REGISTRATION_DEMO.md) for the latest deployment and verification.

Status at this design stage: implemented, awaiting live connectivity verification. Dated 2026-09-26 JST. The approved commit was `453387e`; the same design after rebase was `b537e04`. See the [change log](HACKATHON_CHANGES.md) for the approval source.

[Plan](CURVEGRID_INTEGRATION_PLAN.md) / [Draft PR #1](https://github.com/asagohann777/shomei-kun-qr-proof/pull/1) / [Existing mock design](BACKEND_DESIGN.md)

## 1. Review scope and state at design time

The user selected Curvegrid Testnet, real registration writes, a new owner-registration contract, free-form nicknames, MetaMask connection from normal browsers, and separate API/contract/CLI and UI responsibilities. The ABI, setting names, errors, limits, and CLI operations in this document turn those decisions into a proposal. They were not final until design approval.

| Item | State at design time | Change in this design |
| --- | --- | --- |
| Web API | Next.js, fixed mocks only, three APIs implemented | Keep paths and add live mode and connection checks |
| Chain | DTO and Service refer to 80002 and fixed samples | Keep 80002 in mock mode; live mode uses deployment settings |
| Owner registration | Sample name and simulated transactions only | Actual allowed wallet, free-form input, and ABI-generated transactions |
| Contract and CLI | Not implemented | Solidity and deployment, issuance, and read CLI |
| UI | Independent static mock | UI owner implements screens and MetaMask Connect |
| Publication | Only the UI mock is public | Deploy the backend to another Worker; no publication in this design update |

Amoy in `specs/SPEC.md` and `specs/ARCHITECTURE.md` remains the final target. This change defines earlier Curvegrid Testnet validation. It does not satisfy all existing F01–F10 and A01–A11 requirements. In particular, A07's credential-free verification through an independent public RPC is out of scope.

## 2. Responsibilities and module boundaries

```text
UI owner: mobile screens / MetaMask Connect / tracking after reload
    | Public API                        | Signing and sending
Next.js Route Handler                  MetaMask --> Curvegrid Web3 RPC
    |
Registration Service --> RegistrationGateway
                             | mock: existing fixed responses
                             | live: MultiBaas REST API --> Curvegrid Testnet

Local issuer CLI --> MultiBaas management and transaction preparation / local signing --> Web3 RPC
```

The backend owner maintains `apps/web/src/backend/`, API Route Handlers, OpenAPI, contracts, CLI, and Workers configuration. The UI owner maintains pages, components, CSS, translations, and browser wallet and tracking logic. The backend supplies API examples and ABI artifacts. The UI owner incorporates shared package and lockfile changes after the backend foundation is added, avoiding simultaneous edits to the same files.

- `config` converts environment settings into discriminated mock/live types. Request bodies do not select destinations.
- `http` validates paths, JSON, origins, and headers; produces shared responses; and sanitizes exceptions.
- `service` checks registration conditions and transaction correspondence. It does not use fixed samples to decide live results.
- `multibaas-gateway` calls REST, validates responses at runtime, and converts them to internal types through the ABI.
- Existing Mock Gateway and Mock Wallet remain mock-only. The real wallet SDK belongs in the UI.

Alongside the internal Gateway's `registry`, types must support connection status, blocks, transaction input, and receipt blockHash and raw logs. Validate external JSON at boundaries and convert invalid responses to 503. Generate public DTOs from OpenAPI and precompile Workers validators as before.

## 3. Configuration and trust boundaries

| Setting | Storage and purpose |
| --- | --- |
| `BACKEND_MODE` | `mock` or `live`; missing or unknown values are configuration errors |
| `MULTIBAAS_BASE_URL` | Server setting; HTTPS deployment URL including `/api/v0` |
| `MULTIBAAS_API_KEY` | Cloudflare Secret; application key limited to reads and unsigned transaction preparation |
| `CHAIN_ID` | Expected numeric live ID, checked against the MultiBaas environment; do not reuse 80002 |
| `REGISTRY_ADDRESS` / `REGISTRY_CONTRACT_LABEL` / `REGISTRY_CONTRACT_VERSION` | Fixed deployment and MultiBaas Library ABI definition |
| `REGISTRY_DEPLOYMENT_BLOCK` / `REGISTRY_ISSUER` | Event starting block and expected issuer |
| `CURVEGRID_PUBLIC_WEB3_RPC_URL` | HTTPS RPC URL created with a dedicated public Web3 key for wallet distribution |
| `ALLOWED_UI_ORIGINS` | Comma-separated exact origins; empty allows only the same origin |
| `PUBLIC_API_ORIGIN` | This API's HTTPS origin; localhost HTTP allowed only for local development |

At design time, actual Curvegrid Testnet chain ID, RPC URL, contract, issuer, and MultiBaas label were not obtained. These values belong to the user's existing environment. Do not fill them with invented values and claim connectivity.

With only `BACKEND_MODE=live` set and connection values missing, the Worker may start so the connection API can return missing setting names. Card and registration APIs stop with 503. Secrets are not required at build time. A missing or unknown mode itself remains a configuration error. Partial live settings do not fall back to mock values.

Treat the public Web3 RPC URL as a setting exposed to the browser and MetaMask. Use only a dedicated URL issued with a MultiBaas public Web3 key. Do not expose admin API keys through URLs or browsers. Do not log API keys or complete RPC URLs. Do not configure the CLI admin key or issuer key in Cloudflare.

CORS matches origins exactly. Add `Access-Control-Allow-Origin` and `Vary: Origin` only for allowed origins. Do not use cookies or credentials. OPTIONS allows GET, POST, and Content-Type and returns 204. Accept CLI requests without Origin. Reject unapproved origins and `null` origins with 403. CORS is not user authentication; the contract enforces registration permissions.

## 4. Public API contract

Keep the existing success `{meta:{mode},data}` and error `{meta:{mode},error:{code,message}}` formats. `message` is diagnostic English. The UI chooses Japanese or English copy from the code and state. Every response requires `Cache-Control: no-store`, with additional delivery directives allowed.

| API | Live behavior |
| --- | --- |
| `GET /api/v1/connection` | Check configuration, MultiBaas authentication, chain, latest block, RPC, and contract in sequence |
| `GET /api/v1/cards/{cardId}` | Read contract state and registration evidence; available to viewers without a wallet connection |
| `POST /api/v1/cards/{cardId}/registration/prepare` | Check registration conditions and obtain an unsigned register transaction from MultiBaas |
| `GET /api/v1/cards/{cardId}/transactions/{txHash}` | Compare the transaction, receipt, event, and current registration |

In live mode, any `X-Mock-Scenario` header returns 400 `INVALID_MOCK_SCENARIO`. Align existing live-header rejection tests with this code. Preserve the three mock APIs, fixed values, and 19 scenarios. The mock connection response explicitly returns `mode:mock`, `status:"mock"`, and a fixed registry only. It must not resemble live ready status.

### Connection checks

Missing settings return 503 `CONFIGURATION_MISSING`. Only this code adds `error.details` as `{missingSettings: string[]}`; never return setting values. Other errors retain code/message. Define details as a code-specific union in OpenAPI.

Successful data has the following structure. Populate values from configuration and actual reads without mixing in mock values.

```text
{
  status: "ready",
  network: {
    name: "Curvegrid Testnet", chainId: number,
    nativeCurrency: {name: "Ether", symbol: "ETH", decimals: 18},
    rpcUrls: [publicWeb3RpcUrl]
  },
  registry: {chainId, contractAddress, issuer},
  latestBlock: {number: number, hash: string},
  nicknameMaxUtf8Bytes: 96
}
```

Compare the MultiBaas chain ID, RPC `eth_chainId`, and expected configuration. Check the MultiBaas-linked address and ABI version, RPC `eth_getCode`, and contract `issuer()` and `schemaVersion()`. Use only the expected ABI; requests cannot select arbitrary functions. Ready means connectivity succeeded at that time. It does not guarantee an unconnected MetaMask wallet or a future transaction. Registration preparation also checks chain and deployment correspondence.

### Cards and registration preparation

Keep `cardId` restricted to 1–64 alphanumeric, `_`, or `-` characters. Preserve address and hash formats and lowercase only hexadecimal values. The app supplies the card name Shomei Ichiro. Do not add APIs for other players or image management.

Preparation requires exactly three JSON fields: `walletAddress`, `chainId`, and `nickname`. Keep the 16 KiB body limit. Introduce free-form input only in live mode, with 1–96 UTF-8 bytes and no trimming or Unicode normalization. Reject isolated JSON surrogates with 400 to prevent changes through replacement characters during encoding. Document live UTF-8 restrictions in OpenAPI and check byte length and Unicode validity at the HTTP boundary. Preserve the existing mock input contract.

Check format and size, the live scenario header, settings, upstream retrieval, unissued state, already-registered state, chain, and allowed wallet in that order. Server-side address equality is a preparation condition, not proof of identity.

Return the existing transaction format `{chainId,from,to,data,value:"0"}`. Omit nonce, gas, and fees; MetaMask chooses them. Decode calldata through the ABI and verify `register(cardId,nickname)`, from, to, chainId, and value before returning it. Reject `data:"0x"` in live mode. Preparation never sends a transaction.

The UI also checks that the submitted name matches the registration result. Do not treat client-supplied expected values as chain evidence.

### Errors

Preserve existing 400, 404, 409, 413, 415, 422, 500, and 503 behavior, and add the following. Existing mock error responses remain unchanged.

| HTTP and code | Condition |
| --- | --- |
| 400 `INVALID_INPUT` | Includes empty live names, names over 96 bytes, and invalid Unicode |
| 403 `ORIGIN_NOT_ALLOWED` | Unapproved origin |
| 503 `CONFIGURATION_MISSING` | Missing live settings; details include names only |
| 503 `CONNECTION_MISMATCH` | Chain, deployment, issuer, or schemaVersion differs from configuration |
| 503 `MULTIBAAS_AUTH_FAILED` | Upstream 401/403; do not present as the user's wallet authentication failure |
| 503 `UPSTREAM_TIMEOUT` | Upstream call timed out |
| 503 `UPSTREAM_UNAVAILABLE` | Network errors, 429/5xx, unknown 404, invalid JSON or ABI, and similar failures |

For GET connection, missing settings return 503 with missingSettings, authentication failure returns 503 MULTIBAAS_AUTH_FAILED, and a different configured chain returns 503 CONNECTION_MISMATCH. Do not represent success and communication failure as the same 200 state.

## 5. MultiBaas Gateway

The browser must not call MultiBaas management REST directly. Worker fetch combines the base URL with fixed paths and adds the Bearer key. Use manual redirects and reject 3xx as upstream errors. Limit each upstream call to 10 seconds and each complete API request to 30 seconds. Do not automatically resend or retry. Log only operation, error category, service type, HTTP status, and exception name.

| Gateway operation | API and conversion policy |
| --- | --- |
| Connection status | `result.chainID` and blockNumber from `GET /chains/ethereum/status` |
| Latest or specific block | `GET /chains/ethereum/blocks/{block}`, using `latest` or a number |
| readCard / issuer / schemaVersion | Read functions through `POST /chains/ethereum/addresses/{address}/contracts/{label}/methods/{method}` with fixed destination and function |
| buildRegistrationTransaction | The same methods API with `register`, args, from, and `signAndSubmit:false` |
| getTransaction | `GET /chains/ethereum/transactions/{hash}`; convert hash, chain, from, to, and input to internal types |
| getReceipt | `GET /chains/ethereum/transactions/receipt/{hash}`; validate status, hash, blockHash, blockNumber, and raw logs |
| findRegistrationEvent | Filter `GET /events` by contract_address and event_signature, compare cardKey/cardId within pages, and exclude events before deployment |

Validate the `{status,message,result}` wrapper. Unsigned transactions require `result.tx` and `submitted:false`. The tx format has no chainId field, so set the public transaction chainId from the verified MultiBaas chainID. Transaction retrieval uses `result.data.input`, `result.from`, and `result.isPending`. A matching transaction with isPending=true may be reported pending without waiting for a receipt 404.

Do not pass broad SDK types directly into internal logic. Use separate decimal and 0x quantity parsers. Accept only safe integers for chain IDs and block numbers. Amounts are decimal strings; calldata and logs are 0x byte strings. Receipt status accepts only success 1 or failure 0.

MultiBaas defines read-function `result.output` as arbitrary data. Fix `getCard` to the five-output ABI below. Strictly convert arrays in ABI order or objects with ABI output names. Do not interpret string booleans by truthiness or fill names with JSON.stringify. Sanitize real responses into fixtures and revise the adapter design when additional formats are needed. Do not guess how to accept unknown formats.

A generic MultiBaas 404 does not mean an unissued card or an unseen transaction. A card is unissued only when a successful `getCard` response has `exists=false`. Without a successful response or verified upstream error contract explicitly establishing transaction absence, return 503. Do not unconditionally convert real 404s to 200 unknown or pending.

The event listing has no cardId-specific filter. Set `contract_address` and `event_signature` and read up to 10 pages using limit=10 and offset. Validate the card key after retrieval. If the limit or timeout prevents a complete search, return 503 rather than claiming unregistered status or no evidence. Use `transaction.txHash` for the event's transaction hash.

Read the public card owner from contract state. Find candidate registration evidence through event search, then compare receipt logs and state before returning it. If a successful search is empty, retain the owner and return `evidence:pending`. A failed search request returns 503. Candidates for another deployment or card are not registration evidence.

## 6. Transaction checks and return handling

Alongside chain ID, hash, from, and to, decode input through the ABI to check the function and card ID. Do not report pending or reverted before proving that the transaction calls register for the requested card.

| Condition | Public result |
| --- | --- |
| Successful communication and verified behavior establish transaction absence | unknown / TRANSACTION_NOT_SEEN |
| Matching register transaction has `isPending=true`, or verified upstream behavior establishes receipt waiting | pending |
| Failed receipt for the matching register transaction | reverted |
| Successful receipt, correct event, and card state match | confirmed |
| Card, function, sender, destination, logs, name, or other correspondence differs | unknown / RECORD_MISMATCH |
| API or RPC communication itself fails | 503; do not replace with unknown |

For confirmed, decode raw logs with the local ABI and compare emitter, cardKey, cardId, owner, nickname, transaction, and block. The input name must match both event and current state. Compare the blockHash obtained by block number with the receipt blockHash. Use one confirmation on the current canonical block, without claiming finality or freedom from future reorganizations. A later lookup may return an unconfirmed result if correspondence is lost.

Even if the event index lags, matching receipt logs can establish confirmed status. Transaction rechecks never call a sending API. The server keeps no registration-session or transaction database; it verifies each API request again.

UI handoff conditions:

1. Check connection API ready status, the actual account, and chain ID. Call prepare after consent to publication.
2. Check live mode, ABI, card, name, destination, and value in the prepare response. Read account and chain again immediately before sending.
3. Ask MetaMask to sign and send. Do not start confirmation after rejection.
4. After receiving a hash, save `{chainId,contractAddress,cardId,txHash,nickname}` on the device and query it. The public confirmation DTO does not treat saved client data as evidence.
5. On reload or return, resume only the query. If connection is lost before a hash is returned, report an unknown send outcome and do not resend automatically. Provide a procedure to obtain the hash from MetaMask history and recheck it.

The UI owner implements MetaMask Connect EVM, state displays, device storage, and physical-device browser tests. This PR does not add those UI implementations.

## 7. Contract

The proposal uses Solidity and Hardhat and fixes the target EVM to Paris. Do not assume support for the latest EVM features on Curvegrid. At implementation time, check compatibility and pin final versions in the lockfile and compiler configuration.

```text
constructor(address issuer_)
issuer() -> address
schemaVersion() -> uint256  // 1
issue(string cardId, address allowedWallet)
register(string cardId, string nickname)
getCard(string cardId) -> (bool exists, address allowedWallet,
                          bool registered, address owner, string nickname)
CardIssued(bytes32 indexed cardKey, string cardId, address indexed allowedWallet)
CardRegistered(bytes32 indexed cardKey, string cardId,
               address indexed owner, string nickname)
```

Use `cardKey = keccak256(bytes(cardId))` as the mapping key. Keep the original card ID string in events. Card stores exists, allowedWallet, owner, and nickname. Derive registered from owner != address(0). The immutable issuer rejects the zero address. There is no administrator replacement, proxy, upgrade, transfer, deletion, or arbitrary external call.

In this original restricted-card design, issue requires msg.sender == issuer, a 1–64 byte ID containing ASCII letters, digits, `_`, or `-`, no existing issuance, and allowedWallet != 0. It also rejects changes to the allowed wallet after issuance. Issuance does not complete registration. The correction at the start of this document supersedes the zero-address restriction for unrestricted demo cards.

For a restricted card, register requires that the card exists, is unregistered, msg.sender == allowedWallet, and the name is 1–96 bytes. It saves owner and nickname in the same transaction and emits an event. It is nonpayable and accepts no funds. The contract's name constraint is byte length, not real identity, uniqueness, or Unicode normalization. It does not replace the API's UTF-8 boundary validation.

An unissued `getCard` returns `(false,0,false,0,"")`. The contract also rejects duplicate registration, preventing a later write from overwriting a registration if state changes between API checks and sending. Custom errors are UnauthorizedIssuer, InvalidCardId, InvalidWallet, CardAlreadyIssued, CardNotFound, AlreadyRegistered, WalletNotAllowed, and InvalidNicknameLength.

## 8. Issuer CLI and reruns

The CLI uses Node.js and TypeScript, with ethers for local signing and ABI handling. Hardhat compiles contracts and runs local tests. The UI owner chooses the browser signing library and integrates through EIP-1193 and the public transaction format.

| Command | Behavior |
| --- | --- |
| `issuer deploy --state <file> --keystore <file>` | Register compiled ABI/bytecode in the MultiBaas Library and prepare unsigned deployment. After local signing and sending, verify receipt and deployment, then configure ABI linking and event synchronization |
| `issuer issue --card-id <id> --wallet <address> --state <file> --keystore <file>` | Read existing issuance and prepare and validate unsigned issue through MultiBaas. After local signing, sending, and confirmation, print the public verification API URL |
| `issuer show --card-id <id>` | Display state through MultiBaas; no signing key required |
| `issuer resume --state <file>` | Check the recorded transaction and resume incomplete steps such as post-deployment linking. Never automatically create another transaction |

The table preserves the original restricted-issuance command. For current unrestricted demo issuance, omit `--wallet`, as described in the opening correction.

Library registration sends `label,contractName,version,rawAbi,bin` to `POST /contracts/{label}`. rawAbi is a JSON ABI string. Deployment sends constructor arguments, from, and signAndSubmit:false to `POST /contracts/{label}/{version}/deploy`. The receipt's contractAddress establishes successful deployment; do not rely only on an arbitrary deployAt response field. Linking sends label/version/startingBlock to `POST /chains/ethereum/addresses/{address}/contracts`. Convert startingBlock from the deployment receipt number to a decimal string; do not replace it with latest on resume.

The CLI uses a separate `MULTIBAAS_ADMIN_API_KEY` and `ISSUER_KEYSTORE_PATH`. Enter the decryption password through hidden terminal input. Do not leave keys or passwords in argv, output, or PRs. Do not assume issuer and registering wallets share a key. Do not add issue or deploy operations to the Web API.

Before signing, compare RPC chain ID and issuer address, then obtain pending nonce, gas estimate, and fees. Use EIP-1559 when baseFee is supported and legacy fees otherwise. Check deployment bytecode and constructor arguments, or issuance destination, function, arguments, and value, against the local ABI. If validation or estimation fails, do not sign or send. Only the same transaction with its fixed nonce and fees may be rebroadcast.

Keep the state file outside Git with mode 0600. Store chain, issuer, contract or bytecode hash, arguments, nonce, signed raw transaction, its hash, and the current step. It has no private key, but the signed transaction can be rebroadcast, so do not publish it. Save atomically before sending. A lock file rejects concurrent operations on the same state.

Resume first queries the existing hash. Only after a successful check establishes absence may explicit `--rebroadcast` send the identical raw transaction again. Do not resend merely because communication failed. If another transaction consumed the nonce, stop for review. Do not automatically switch to a new state file after interruption.

For an already-issued cardId, display existing state without sending if the allowed wallet matches; otherwise fail. Reuse the same Library label/version only if ABI and bytecode match. Stop without overwriting mismatches. Always set linking `startingBlock` to the deployment block and enable event synchronization. After success, print actual deployment values and apply them to environment configuration.

## 9. Deployment, parallel development, and migration

The Worker name is `shomei-kun-integration`. Do not overwrite `shomei-kun-ui-mock` or `shomei-kun-api-mock` settings. Add and explicitly select a dedicated Wrangler configuration, with self-reference pointing to the same Worker name. Use the current Next.js and OpenNext setup without adding R2 or D1.

Change the current OpenAPI only after design approval. Update shared DTOs, fixtures, and ABI first, and inform the UI owner of contract changes. Then implement Gateway, Service, and CLI. Keep existing mock behavior available locally and through its existing configuration.

Generalize live chainId to a positive safe integer and constrain the actual value through deployment settings. Preserve meta.mode, unregistered/registered states, none/pending/available evidence, and pending/confirmed/reverted/unknown transaction states. Add only the new connection response and errors. Update generated types, validators, and contract tests in the same change.

For a UI on another origin, the UI owner configures the API base URL and the API owner allowlists the actual UI origin. Do not add wildcard CORS or an arbitrary RPC relay. API design can proceed before URLs are known; actual values are deployment settings.

After design approval, publish in this order: local tests, contract deployment, permission and configuration checks, Worker publication, real API reads, registration signed by the owner, and reads from another device. Do not call the integration verified while API keys are missing or phone checks are incomplete. This PR design update does not deploy.

Roll back Worker problems to the previous version. Chain registrations cannot be rolled back. If the contract needs changes, test a separate deployment with new card IDs and preserve existing records. Treat Amoy migration as a separate deployment too; do not claim Curvegrid records migrate automatically.

## 10. Tests and acceptance criteria

These were planned, unexecuted tests at design time. Distinguish passed existing mock tests from new real-connection tests.

| ID | Test and expected result | Environment |
| --- | --- | --- |
| C01 | Existing three mock APIs, 19 scenarios, and fixed values unchanged; mock headers rejected in live mode | Node / Next.js / Workers |
| C02 | Missing settings, REST authentication rejection, wrong chain, and wrong deployment never return success; no Secrets in responses or logs | Contract tests and configured live environment |
| C03 | Allowed, same, absent, and rejected origins and OPTIONS; errors also use no-store | HTTP |
| C04 | Unissued 404, upstream 404 as 503, registered 409, other wallet/chain 422, free-form 1/96/97-byte names, Japanese, isolated surrogates | API |
| C05 | Issuer permissions, zero address, invalid ID, duplicate issuance, unissued registration, another wallet, repeat and concurrent registration, name length | Local EVM |
| C06 | Modified register calldata, from, to, chain, or value rejected during preparation or confirmation | Gateway / Service |
| C07 | Distinguish wrong card, owner, name, logs, failed receipt, absence, communication failure, and blockHash mismatch | Gateway / Service |
| C08 | Retain owner on empty event search; search failure returns 503; receipt alone can establish a match | Gateway / Service |
| C09 | Interrupted deployment/linking, resume of the same state, reissuance of the same card, different arguments, and concurrent CLI; no unsolicited new transaction | Local and configured live environment |
| C10 | After configuration, connection GET, card reads, real registration, reload, and disconnected reads from another device agree | Curvegrid Testnet |
| C11 | Browser to MetaMask and back, rejection, account/chain switching, loss before hash, re-query after sending, no automatic resend | Phone integration with UI owner |
| C12 | Check 320/390px and desktop widths, Japanese and English, layout failures, and console errors | UI owner |

For C10/C11, record chain ID, contract, cardId, registration hash, block, device, and check time. Do not include API keys or signed raw transactions. Record coverage of F/A requirements and keep A07 public-chain verification incomplete.

## 11. Review checklist

- Free-form input of 1–96 UTF-8 bytes with no string modification.
- Fixed issuer, immutable allowed wallet, and one-time registration ABI.
- Boundaries for the separate API URL, connection response, errors, CORS, and public Web3 settings passed to the UI.
- Local encrypted keystore, resume state, and deployment and issuance CLI operations.
- Existing mock compatibility and implementation and live verification only after user approval.

The change log records the approved PR commit SHA and the user's confirmation. Complete OpenSpec artifacts alone do not establish approval.

## 12. Sources and environment information not yet obtained

Distinguish documented API usage from facts about an environment not yet connected at design time. MultiBaas URL, keys, actual ABI responses, RPC, chain ID, permissions, synchronization, and phone behavior were unverified. They are values to configure or retrieve later, not successful design examples.

- [Curvegrid Testnet Web3 settings and faucet](https://docs.curvegrid.com/multibaas/networks/curvegrid-testnet/)
- [Management API keys and public Web3 keys](https://docs.curvegrid.com/multibaas/api-keys/)
- [Unsigned transactions and browser signing](https://docs.curvegrid.com/multibaas/getting-started/build-a-frontend/)
- [MultiBaas TypeScript SDK Chains API](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/ChainsApi.md)
- [Contract management](https://docs.curvegrid.com/multibaas/manage-contracts/)
- [MetaMask Connect EVM](https://docs.metamask.io/metamask-connect/evm/)
- [Function arguments and unsigned transactions](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/PostMethodArgs.md)
- [Unsigned transaction fields](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/TransactionToSignTx.md)
- [Read-function output](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/MethodCallResponse.md)
- [Transactions and isPending](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/TransactionData.md)
- [Event listing](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/EventsApi.md)
- [Library registration](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/BaseContract.md)
- [Linking and starting blocks](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/LinkAddressContractRequest.md)
- [Conversation decisions and sources](../docs/prompts/curvegrid-integration-decisions.md)

## 13. Implementation references

See the [startup and UI connection runbook](CURVEGRID_INTEGRATION_RUNBOOK.md), [Solidity and CLI guide](../contracts/README.md), and [OpenAPI](openapi.yaml). The API and CLI share the compiled ABI artifact. Check MultiBaas ABI linking through the address's contracts and compare the Library label, version, and ABI.

C10/C11/C12 in this document remain live-environment and UI integration checks at this stage. Local tests are not evidence of real connectivity.
