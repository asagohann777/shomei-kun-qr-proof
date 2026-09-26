English | [日本語](UI_LIVE_CONNECTION_REPORT.ja.md)

# Latest UI and live API connection results

Update: demo registration now allows everyone. See [current registry, demo cards, and results](OPEN_REGISTRATION_DEMO.md). The following is historical evidence from the designated-wallet approach. Old chain records remain, but the public API's default registry is now a new contract.

2026-09-26 JST. Implemented in PR #1's dedicated worktree, based on origin/main `3598094`. Rechecked the same SHA before completion. The existing UI mock Worker was not updated. The relationship to the hackathon period is unconfirmed.

## Public URLs and actions

- [Entry](https://shomei-kun-integration.dptr.workers.dev/ui/)
- [Unregistered manual card](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=mobile-ui-20260926-manual)
- [Automated-test card](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=mobile-ui-20260926-001)

A card URL shows its owner without wallet connection. Unregistered cards proceed through nickname, MetaMask connection, review of public information, and transaction approval. The entry scan button opens a simulated camera and then the test card. Real camera capture is out of scope.

Registration requires the connected address to match the issuer's allowed address. The API confirms actual registration; no screen timer declares success. Save the transaction hash with card, chain, registry, and API origin. Return/reload resumes queries only. If a response becomes unknown before receiving a hash, check MetaMask history for the hash without automatically resending.

## Test wallet

Created a dedicated wallet at the user's request. Its address and public key are in the [public information](assets/curvegrid-connectivity/mobile-ui-wallet.json).

Address `0x208Fa3cd72959b2562c898B3b7Fc75C0C6fcA99E`. Curvegrid Testnet, chain ID `2017072401`. The issuer wallet supplied 0.05 test ETH.

The private key is encrypted at `/tmp/shomei-kun-curvegrid-integration/contracts/.issuer-state/mobile-ui/wallet.keystore.json`. The password is in `password` in the same directory. Directory mode is 0700, files 0600, both outside Git. They are excluded from Workers, browsers, and submission materials. To operate the same address on a device, the user must import this test account into their MetaMask. A public address alone cannot sign.

| Card | Purpose | Issuance transaction |
| --- | --- | --- |
| `mobile-ui-20260926-001` | Real transaction test through the browser | `0xd435fd7751f81da80bb26e29f208d2759afab5e5d679b407405773ed5c019c20` |
| `mobile-ui-20260926-manual` | Manual phone test, kept unregistered | `0xa53a0d295af58b86879e1d1f0a04298233cbfdabaab33d20242ae5c12e8cd85e` |

## Reproduction

```sh
cd prototypes/mobile-ui
npm ci
npm run build
npm test
# Start npm run dev in another terminal
npm run verify

cd ../../apps/web
npm ci
BACKEND_MODE=live npm run build:integration
npx wrangler deploy --config wrangler.integration.jsonc
```

Deploy to the dedicated integration Worker. See the [runbook](CURVEGRID_INTEGRATION_RUNBOOK.md) for required settings. UI builds default to live API and MetaMask; `UI_WALLET_MODE=mock` enables read-only mode. Extract only required public build settings from the API app's `.env.local`. `runtime-env-only.mjs` removes OpenNext's embedded environment values and checks output for known credentials.

Normal UI-design builds remain mock/mock. See the [UI README](../prototypes/mobile-ui/README.md#apiウォレットの切替) for environment variables.

## Verified scope

- Passed 43 UI boundary tests, 66 API tests, and type checks. Responses use OpenAPI-generated validators.
- Verified existing mock scenarios in Chromium/WebKit with zero external requests or console errors.
- Verified live branches with fixtures in both browsers, covering approval, pending, API-confirmed, reload, duplicate prevention, API failure, and read-only mode.
- Reviewed 320/390/1365px images. No horizontal overflow, fixed-element overlap, broken images, or console errors.
- The public Worker root redirects to `/ui/` while retaining card ID. UI/JS return 200. CSP permits only same origin, configured API/RPC origins, and MetaMask relay connections.
- Dedicated Worker build and secret checks passed. Initial version `841d26fa-2222-4c0c-854d-7d017a096cc7`; after SDK fixes, `b380129d-60af-4240-a326-f52287daec89`.

Separate browser fixtures from real-chain tests signed with a local test key. Neither proves a round trip through MetaMask on a physical phone.

## Real registration through the public UI

Registered `mobile-ui-20260926-001` with nickname `おじいちゃんコンビニ`. Transaction `0x6e28d940225fb8a5ef0efc2020484d08275d87b33fbd8befa71253ccb077b9ee`, block `18772`. The wallet submitted once. After the API returned confirmed, reload and an unconnected separate browser context showed the same owner.

Saved [measured JSON](assets/ui-live-2026-09-26/chain-results.json), [390px completion](assets/ui-live-2026-09-26/390-confirmed.png), [320px third-party English view](assets/ui-live-2026-09-26/320-public-en.png), and [fixture browser tests](assets/ui-live-2026-09-26/browser-results.json). The private key stayed inside the Node process, with EIP-1193 replaced by a test provider.

## SDK browser-bundling fix

A browser test without injected real wallets found that MetaMask SDK dynamic import returned only a CommonJS default export, failing SessionStore and PrivateKey initialization. Resolve core and dapp-client to bundled ESM. For CommonJS-only eciesjs, expose required exports through a small ESM boundary. Pin dependencies and verify the actual served bundle with `scripts/verify-metamask-sdk.mjs`.

This test loads the SDK from a disconnected state in an iPhone-like browser, then checks MetaMask app-launch links and relay initiation. It stops before switching apps and does not prepare/send transactions. This is distinct from physical-phone return testing. Both Chromium and WebKit passed against the fixed public URL with zero errors or transaction-preparation requests. Saved [SDK measurements](assets/ui-live-2026-09-26/sdk-results.json).

## Remaining checks

1. On a physical phone, move from an external browser to MetaMask and test connection, approval, rejection, browser return, disconnection, and requery. The SDK uses HTTPS universal links and relay. Actual OS return behavior is unverified.
2. Open the same QR on another physical device and check owner/transaction, separately from browser-context tests.
3. MetaMask Connect EVM 2.1.1 dependencies retain six moderate npm audit findings. They concern transitive uuid v3/v5/v6 buffer-boundary validation. Its direct usage in the SDK's Node file handling is v4. No forced override was applied without compatibility checks. Recheck supported SDK versions and audits on update.

Physical-device checks remain, so OpenSpec 6.2/6.3 and A07 as a whole are not complete.

To repeat real-chain tests, issue a new card allowing the same test wallet through the CLI. Do not submit a new transaction for a registered card or reuse the same submission state.

```sh
cd prototypes/mobile-ui
LIVE_TEST_CARD_ID=NEWLY_ISSUED_ID \
LIVE_TEST_KEYSTORE=../../contracts/.issuer-state/mobile-ui/wallet.keystore.json \
LIVE_TEST_PASSWORD_FILE=../../contracts/.issuer-state/mobile-ui/password \
LIVE_TEST_TRANSACTION_FILE=../../contracts/.issuer-state/mobile-ui/NEW_TEST_NAME.json \
node scripts/verify-live-chain.mjs
```

In this verification environment, missing WebKit OS libraries were unpacked into `/tmp/shomei-webkit-deps`, using the existing `/tmp/shomei-browser-runtime` launcher. Standard Playwright suffices where required libraries are installed. `PLAYWRIGHT_BROWSERS_PATH=/tmp/shomei-browser-runtime PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` applies to this test environment and is not an app requirement.
