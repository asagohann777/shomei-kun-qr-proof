English | [日本語](CURVEGRID_CONNECTIVITY_REPORT.ja.md)

# Curvegrid connectivity tests and issues

2026-09-26 JST. The initial target was PR #1 at `bcfcede`. The first attempt stopped because settings were missing. Using credentials later configured by the user, the team read MultiBaas status, blocks, and Library entries and registered this ABI. Deployment, issuance, registration on the testnet, and evidence retrieval through the local API then succeeded. The dedicated Worker also passed connectivity, owner, registration transaction, reload, and duplicate-registration rejection checks. Local API startup, management REST access, and chain writes are distinct results.

See the [UI connection report](UI_LIVE_CONNECTION_REPORT.md) for later results involving the latest UI, signing, and public browser tests.

## Incorporating the latest main

At the user's request, `git pull --rebase origin main` fetched `origin/main` at `cdb1ffe`. The branch already included it at the first check. Before completion, a second fetch found `origin/main` at `3598094`, so the work was rebased onto that commit. An append conflict in `HACKATHON_CHANGES.md` was resolved by preserving both UI and API entries. There were no differences in `apps/web` or `contracts` before and after the rebase, so the verified code remained unchanged.

## Initial checks

| Check | Observed result |
| --- | --- |
| Connection settings | Checked `.env*`, `.dev.vars*`, and shell variables in the dedicated worktree and original checkout, including root, apps/web, and contracts. No MultiBaas settings were present. Values were not printed |
| Live API startup | Started with `BACKEND_MODE=live PUBLIC_API_ORIGIN=http://127.0.0.1:3108 npm run start -- --hostname 127.0.0.1 --port 3108` |
| `GET /api/v1/connection` | 503, `meta.mode=live`, `CONFIGURATION_MISSING`, and `Cache-Control: no-store` |
| `GET /api/v1/cards/connectivity-check` | Same 503. No classification as unissued or unregistered, and no card issuance |
| OPTIONS for registration preparation | 204. Allowed the same origin and answered preflight for GET, POST, and Content-Type |
| Dedicated Cloudflare Worker | Ran `wrangler deployments list --config wrangler.integration.jsonc` with external network access. `shomei-kun-integration` did not exist; Cloudflare code 10007 |

The Cloudflare result indicated a missing dedicated Worker, not invalid credentials or a MultiBaas outage. The API stopped on missing settings rather than switching to fixed mocks. The existing UI Worker was not changed.

## Initial issues and actions

| ID | Classification | Issue and impact | Next action |
| --- | --- | --- | --- |
| C-01 | Observed blocker | Missing MultiBaas settings prevented chain access | Locate a configured file or set values in Git-excluded `apps/web/.env.local` |
| C-02 | Observed missing deployment | No dedicated Worker was available at a separate URL | After connectivity checks, configure variables and Secrets and deploy the dedicated configuration |
| C-03 | Write-test prerequisite | Deployment, issuer, allowed wallet, and signing method were not provided. Actual contract deployment was unknown | Configure an existing deployment or prepare a CLI admin key, issuer keystore, and gas for a new deployment. The owner enters the password at the terminal |
| C-04 | Unverified | Real MultiBaas formats, permissions, ABI links, and event synchronization compatibility were unknown | Verify real responses after connecting and save sanitized fixtures and results |
| C-05 | UI integration prerequisite | This PR covered API, contract, and CLI. The existing UI mock did not sign with real MetaMask | Coordinate endpoint, real wallet, and phone-return tests with the UI owner |
| C-06 | Local startup note | `next start` warned that the standalone server was recommended. HTTP responses were obtained | Use `npm run dev` for development and dedicated OpenNext configuration for Workers. Do not classify this as Cloudflare deployment failure |

C-01 lacked these nine API settings. `PUBLIC_API_ORIGIN` was supplied for the local test.

```text
MULTIBAAS_BASE_URL
MULTIBAAS_API_KEY
CHAIN_ID
REGISTRY_ADDRESS
REGISTRY_CONTRACT_LABEL
REGISTRY_CONTRACT_VERSION
REGISTRY_DEPLOYMENT_BLOCK
REGISTRY_ISSUER
CURVEGRID_PUBLIC_WEB3_RPC_URL
```

See the [runbook](CURVEGRID_INTEGRATION_RUNBOOK.md) for each setting's purpose. Do not paste API keys, private keys, or decryption passwords into chat or PRs.

## Tests after configuration

1. Compare MultiBaas and RPC chain IDs, deployed code, ABI, and issuer. Confirm that the connection API returns ready.
2. Issue a dedicated test card and check its unregistered state and allowed wallet.
3. Register with the owner's wallet. Compare the hash, successful receipt, event, current owner, and name.
4. Reload the same QR card and check it from another device. Verify rejection of duplicate registration and unauthorized wallets.
5. Save chain ID, contract, card ID, transaction hash, block, check time, and device. Mark only successful tests complete in OpenSpec.

At the first check, deployment, issuance, registration, and Worker publication had not happened. Later results follow.

## Sources

- [Request for connectivity tests and issue review](../docs/prompts/2026-09-25/212734-547384-542a7b515a2144d98caa79fbd97635b9.json)
- [Instruction to rebase onto the latest main](../docs/prompts/2026-09-25/212840-675778-f0efeecdb2e447d5bf28a11e0031b256.json)

## Observations and fixes after settings were supplied

The user prepared `.env.local`. The names `MULTIBASS_API_KEY` and `MULTIBASS_ENDPOINT_URL` were corrected to `MULTIBAAS_API_KEY` and `MULTIBAAS_BASE_URL` without printing secret values. The file remained mode 0600 and excluded from Git. The observed chain ID and registered Library label and version were saved in the same file.

| Operation | Observed result |
| --- | --- |
| Chain status GET | HTTP 200. Chain ID and network ID `2017072401`, block `18763` |
| Latest block GET | HTTP 200. Number was a decimal string and hash had a 0x prefix, matching Gateway expectations |
| Existing Library and link listing GET | HTTP 200. This Registry was absent and there were no address links. Existing Library entries were not changed |
| Library registration POST | Initially 400 `unable to parse JSON`. Preserving the 0x prefix in bin returned 200 |
| Library reuse | ABI and bytecode for `shomeikuncardregistry` / `1.0.0` matched the local artifact. CLI succeeded without re-registration |

[Observed JSON](assets/curvegrid-connectivity/multibaas-readonly.json) was saved without secrets or existing-project information. This did not yet prove that the public API was ready or that wallet registration worked.

### C-07: ABI registration bytecode format, fixed

The CLI removed the leading `0x` from bytecode in `bin`. Real MultiBaas returned HTTP 400. With the same ABI, label, and version, retaining only that prefix changed the response to 200. `contracts/cli/multibaas.ts` was fixed, and a regression test checks that POST includes 0x-prefixed bytecode. Earlier synthetic-response tests did not check this request condition.

### Remaining settings and live tests

- After adding a dedicated public Web3 RPC URL, `eth_chainId` was measured as `2017072401`. The admin REST key was not reused for RPC.
- At the user's choice, dedicated issuer and registering wallets were created. Encrypted keystores were saved outside Git with mode 0600. Faucet deposits of 1 ETH to each wallet were observed.
- After contract deployment, address, issuer, and deployment block were configured.
- A separate application key was created in the DApp group. Status and Library reads returned 200, while admin groups reads returned 403. The Worker does not use the admin key.
- The dedicated Worker was published. Live connectivity and public settings were verified. Phone signing, app return, and another-device checks remained incomplete.

C-01 and C-03 were resolved. C-04 gained real-response fixtures and regression tests. C-02's public configuration was complete, leaving C-05 phone UI integration.

After the fix, CLI type checking and 16 contract and CLI tests passed. Public test addresses used for the faucet were:

- Issuer: `0x742685dF0832515184334FaA2d28931AD2605100`
- Registering wallet: `0xf12904Ef7aBfD79b68dcCdc7b30cFDE2D6BEeeb8`

Private keys and decryption passwords are not recorded.

## Actual chain deployment and registration results

| Item | Observed value |
| --- | --- |
| Chain ID | 2017072401 |
| Contract | `0xE226ABd4e3866568C7bd53a57f2CA4b619EFB47e` |
| Deployment transaction / block | `0xc8bce4cd994f9cb2520ef42e2b8aaae3e88173b26199841f23acbf9e81f994e1` / 18766 |
| Card ID | `connectivity-20260926-001` |
| Issuance transaction / block | `0xda58f704b15a05798b61b0a5b045b5906eb5ce9d9281fe35bd08a4fc0c5afec4` / 18767 |
| Registration transaction / block | `0x83f7601a0eae1123029e0f407ecd5e72ebd4d9b34e5181363bf8cabab6a9cb12` / 18768 |
| Name | おじいちゃんコンビニ |
| API connection | 200 ready, with chain, code, ABI, and issuer compared |
| Unregistered card | 200 unregistered |
| Unauthorized wallet preparation | 422 WALLET_NOT_ALLOWED |
| Owner preparation | 200. After comparing from, to, chain, value, and calldata, signed with the owner's test key |
| Registration check | 200 confirmed. Transaction, receipt, event, and current owner matched |
| Public card re-query | 200 registered, evidence available. Repeated reads matched |

Deployment and issuance used CLI execute/resume. A script signed registration with a dedicated test key and saved the signed transaction outside Git before sending. This did not prove phone or MetaMask operation. Duplicate issuance and registration produced CALL_EXCEPTION through eth_call against the deployed contract. No additional transaction was sent for those checks. RPC did not return a revert reason, so no specific error name is claimed.

[Real API fixtures](assets/curvegrid-connectivity/api-responses.json) and [local HTTP verification](assets/curvegrid-connectivity/local-api-verification.json) were saved. Regression tests synthesize only RPC chain/code responses; MultiBaas card, event, transaction, receipt, and block values are measured responses.

### C-08: Development server bundler differences, fixed

Default Turbopack could not access the shared ABI. After expanding its scope, importing the generated CJS validator failed with `func1 is not a function`. `npm run dev` was changed to use Webpack, like the existing build. Card GET and registration preparation POST then returned 200 in actual checks.

### C-09: Event page size, fixed

`GET /events` with limit=100 returned 400 `invalid request`, while limit=10 returned 200. Keeping contract_address and event_signature unchanged, the Gateway switched to up to 10 pages of 10 events. Reaching the limit still returns 503 rather than claiming no evidence. Searches beyond 100 registrations need another approach, such as Event Query. Regression tests cover page size, offset, and owner and transaction checks against real-response fixtures. Query fields were checked against [Curvegrid's official API documentation](https://docs.curvegrid.com/multibaas/api/get-event-count/); accepted sizes were checked in the actual environment.

### C-10: OpenNext embedded local environment values, fixed

Build inspection found that OpenNext 1.20.6 included `.env.local` values in `.open-next/cloudflare/next-env.mjs`. Deployment was stopped. `runtime-env-only.mjs` was added to remove embedded environment values for every mode after building. Deployment resumed only after checking that the original keys and RPC values were absent from artifacts. The deployment list was empty immediately after the interrupted attempt. Admin keys and private keys are excluded from runtime configuration.

### C-11: Public Worker Secrets, completed after approval

The dedicated URL is https://shomei-kun-integration.dptr.workers.dev . The initial deployment version was `8f5afe00-4234-436f-85ab-4382afc5fec1`. Before configuration, the connection check returned 503 CONFIGURATION_MISSING. Automatic approval review rejected saving the app API key and connection settings to Cloudflare Secrets because sending credentials to that external destination required explicit authorization. After the user explicitly approved saving them and continuing connectivity tests, 11 Secrets were saved. The original UI Worker was unchanged.

## Reproduction and remaining checks

Run the following in `apps/web`. The result removes the RPC URL.

```sh
node scripts/verify-live.mjs http://127.0.0.1:3108 connectivity-20260926-001 0x83f7601a0eae1123029e0f407ecd5e72ebd4d9b34e5181363bf8cabab6a9cb12
```

After configuring the public deployment, replace the first argument with the dedicated Worker origin. At this stage, phone MetaMask approval, rejection, disconnection, and return, another-device QR reading, and UI display remained unverified. C10 browser conditions, C11/C12, and all of A07 must not be marked complete.

API tests 66, contract and CLI tests 16, type checking, and the OpenNext build passed. AI performed connectivity operations, diagnosis, implementation fixes, and creation of fixtures, tests, and documents. Humans supplied connection settings, public RPC, the decision to create test keys, and faucet deposits. Correspondence with the hackathon period was not verified.

### C-12: Workers fetch redirect setting, fixed and verified publicly

Only the public Worker returned 503 for connectivity. Sanitized diagnostic logs showed that the runtime rejected `redirect: "error"` with a TypeError. This was changed to `manual`, with 3xx rejected as normal upstream HTTP errors. Requests are not resent to another URL. A regression test verifies that a 302 fails after one call. Changing the call context did not fix the issue, so that temporary change was removed. Temporary logging of error bodies was also removed. Logs retain only service type, HTTP status, and exception name.

## Final public Worker checks

The final deployment version for this report was `04cbc950-4328-4f57-98c6-ba26e110f708`. Running `verify-live.mjs` against the dedicated URL confirmed connection 200 ready, card GET 200 registered twice, transaction GET 200 confirmed, and duplicate preparation 409 ALREADY_REGISTERED. [Public HTTP observations](assets/curvegrid-connectivity/worker-api-verification.json) preserve times and responses with the public RPC URL removed.

[CORS observations](assets/curvegrid-connectivity/worker-cors.json) show 204 for the UI origin's OPTIONS and 403 for an unapproved origin. The 11 approved app connection settings were saved as Secrets, without the admin key. Secret storage was no longer awaiting approval.

The test environment was a Node.js 22 HTTP client on Linux with dedicated test keys. Phone MetaMask and another-device QR UI integration remained outstanding, so not all conditions in OpenSpec 6.2 and 6.3 were complete. Sections 6.1 and 6.4 were complete.
