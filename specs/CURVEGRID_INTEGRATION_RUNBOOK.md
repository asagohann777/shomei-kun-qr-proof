English | [日本語](CURVEGRID_INTEGRATION_RUNBOOK.ja.md)

# Start the Curvegrid integration and connect the UI

The API is in `apps/web`. The contract and issuer CLI are in [contracts](../contracts/README.md). Screen and MetaMask integration code is in `prototypes/mobile-ui`. Normal builds retain mock behavior; only the dedicated integration build connects to the real API. See [UI connection settings and measured results](UI_LIVE_CONNECTION_REPORT.md).

## Run locally

Use Node.js 22.

```sh
cd apps/web
npm ci
BACKEND_MODE=mock npm run dev
```

`GET /api/v1/connection` returns `mode:mock` and `status:mock`. The existing three APIs support fixed responses and `X-Mock-Scenario`. Do not send mock transactions to a wallet.

For a live connection, start with `BACKEND_MODE=live npm run dev`. Missing settings return 503 `CONFIGURATION_MISSING`; fixed mocks do not fill missing values. Set the following in `.env.local`, which is excluded from Git.

| Setting | Value source |
| --- | --- |
| `BACKEND_MODE` | `live` |
| `PUBLIC_API_ORIGIN` | `http://localhost:3000` for local use |
| `ALLOWED_UI_ORIGINS` | Comma-separated UI origins; empty permits only the same origin |
| `MULTIBAAS_BASE_URL` | Your MultiBaas deployment URL ending in `/api/v0` |
| `MULTIBAAS_API_KEY` | Server key limited to reads and unsigned transaction preparation |
| `CHAIN_ID` | Actual value for your Curvegrid Testnet |
| `CURVEGRID_PUBLIC_WEB3_RPC_URL` | RPC URL created with a dedicated public Web3 key |
| `REGISTRY_ADDRESS` / `REGISTRY_ISSUER` | Address and issuer after CLI deployment |
| `REGISTRY_CONTRACT_LABEL` / `REGISTRY_CONTRACT_VERSION` | Label and version registered in the MultiBaas Library |
| `REGISTRY_DEPLOYMENT_BLOCK` | Block number in the successful deployment receipt |

Do not put the admin REST key or issuer private key in `NEXT_PUBLIC_*`, UI settings, conversations, or PRs. The public Web3 URL is visible to the browser because it is passed to MetaMask.

## Call the API from the UI

[OpenAPI](openapi.yaml) is the source of truth for API formats. Set the UI API base URL to the dedicated backend origin. Send cross-origin requests without credentials. Cards, including unregistered cards, can be read before connecting a wallet.

1. Call `GET /api/v1/connection`. Use network settings only when `meta.mode === "live"` and `data.status === "ready"`.
2. Read the card with `GET /api/v1/cards/{cardId}`. A 404 means the card has not been issued. Do not display a 503 as unregistered.
3. Read the actual address and chain ID from MetaMask. After the user consents to publication, send:

```http
POST /api/v1/cards/{cardId}/registration/prepare
Content-Type: application/json

{"walletAddress":"<MetaMask address>","chainId":2017072401,"nickname":"おじいちゃんコンビニ"}
```

`2017072401` is the current integration chain ID. For another deployment, use the connection response and the wallet's actual value. Nicknames must be 1–96 UTF-8 bytes. Do not trim whitespace or normalize Unicode.

4. Validate the response mode, chainId, from, to, value, and register arguments against the ABI. Read the account and chain ID again before signing. If either changed, repeat preparation.
5. Pass `data.transaction` to MetaMask. `chainId` is numeric and `value` is a decimal wei string, so convert them to hexadecimal quantities for EIP-1193. Let the wallet choose the nonce, gas, and fees.
6. After receiving the transaction hash, save chainId, contractAddress, cardId, hash, and the entered nickname. Check `GET /api/v1/cards/{cardId}/transactions/{hash}`.

Continue checking `pending`. For `confirmed`, check that the name and owner match the input. `reverted` means failure. For `unknown`, follow the reason code. Display communication failures as HTTP errors. On return, resume checking the same hash without sending a new transaction automatically. If the connection is lost before a hash arrives, treat the send outcome as unknown and obtain the hash from MetaMask history.

## Dedicated Cloudflare configuration

`wrangler.integration.jsonc` is dedicated to `shomei-kun-integration`. Do not change the existing mock `wrangler.jsonc` or UI Worker. After receiving deployment instructions, register the public and deployment settings above in Cloudflare and store `MULTIBAAS_API_KEY` as a Secret.

Build and verify locally without publishing:

```sh
UI_CAMERA_MODE=live BACKEND_MODE=live npm run build:integration
npm run test:worker:live
```

`test:worker:live` uses a dedicated configuration without connection settings. It checks missing settings, CORS, and rejection of mock scenarios on local Workers. The public UI is `https://shomei-kun-integration.dptr.workers.dev/ui/`.

## Repeat verification

```sh
cd contracts
npm ci
npm run compile
npm run check:abi
npm test
cd ../apps/web
npm ci
npm run generate:check
npm run typecheck
npm test
BACKEND_MODE=mock npm run build
npm run test:http
npm run test:http:live
BACKEND_MODE=mock npm run build:worker
npm run test:worker
UI_CAMERA_MODE=live BACKEND_MODE=live npm run build:integration
npm run test:worker:live
```

`live-gateway.test.ts` uses synthetic responses. `live-recorded.test.ts` uses MultiBaas responses captured on this testnet; its RPC chain and code responses are still synthetic. Section 6 of the [implementation tasks](../openspec/changes/curvegrid-testnet-integration/tasks.md) tracks connectivity after configuration, phone signing, and checks from another device.

## Live settings and builds

After the build, `build:integration` and `build:worker` remove local environment values that OpenNext included. Worker runtime bindings supply connection settings. Do not deploy if the scan for embedded keys or RPC values fails.

Configure these Worker settings: `MULTIBAAS_BASE_URL`, the app's `MULTIBAAS_API_KEY`, `CHAIN_ID`, `REGISTRY_ADDRESS`, `REGISTRY_CONTRACT_LABEL`, `REGISTRY_CONTRACT_VERSION`, `REGISTRY_DEPLOYMENT_BLOCK`, `REGISTRY_ISSUER`, `CURVEGRID_PUBLIC_WEB3_RPC_URL`, `PUBLIC_API_ORIGIN`, and `ALLOWED_UI_ORIGINS`. Do not bulk-upload all of `.env.local`. Use `MULTIBAAS_ADMIN_API_KEY`, the keystore, and the password only in the CLI environment.

See the [connectivity report](CURVEGRID_CONNECTIVITY_REPORT.md) for measured cards, reproduction commands, and remaining checks.

### Camera checks in the integration build

Build the dedicated integration with `UI_CAMERA_MODE=live`. You can also save this setting in `apps/web/.env.local`. The default remains mock, so UI design builds do not request camera permission.

On public `/ui/`, select the QR scan action, allow the camera, and scan an existing card's QR code. Reading from a photo is also available. No transaction is sent before registration.

To check the public build, run `node scripts/verify-camera-public.mjs` in `prototypes/mobile-ui`. It reads a QR video in Chromium and a photo after camera denial in WebKit. The test substitutes a 503 API response to check delivery of the scanned ID and the communication-error display. It does not issue or register a real card.
