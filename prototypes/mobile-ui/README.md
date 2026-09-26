English | [日本語](README.ja.md)

# Shomei-kun mobile UI mock

This static mock lets the team discuss screen designs. It uses daisyUI 5 and Tailwind CSS 4. The default mock does not connect to a real camera, MetaMask, MultiBaas, or Amoy.

Public URL: https://shomei-kun-ui-mock.dptr.workers.dev/

Select the QR scan action to open the simulated camera screen, then read the sample to view a card. The top-right menu selects the language and registered, unregistered, or error scenarios. Use `?scenario=unregistered` to try registration. Input persists only in the same tab and is not shared with another device through the URL. The browser saves the language choice.

## Run locally

Use Node.js 22 and Python 3.

```sh
cd prototypes/mobile-ui
npm ci
npm run dev
```

Open http://localhost:4173/. After changing source files, regenerate output with `npm run build`. Serve only `dist/`.

## Verify in browsers

Run these commands while the local server is running.

```sh
npx playwright install --with-deps chromium webkit
npm run verify
```

The script writes screenshots and result JSON to `artifacts/`. It also checks that served assets match the local build. Run `npm run build` before checking the public site. The results distinguish CSP warnings from the WebKit capture tool's temporary CSS from application errors. To check the public site, run:

```sh
MOCK_BASE_URL=https://shomei-kun-ui-mock.dptr.workers.dev npm run verify
```

These checks use browser emulation. Safari and MetaMask app switching on a physical phone require separate checks.

## Publish

Configure Cloudflare authentication, then run `npm run deploy`. This serves static assets through the dedicated `shomei-kun-ui-mock` Worker. It does not deploy the live app. To publish at another URL, build with that URL in `MOCK_PUBLIC_URL` so the card QR codes also update.

Codex created the SVG icons. Ojiichan Konbini supplied the backgrounds, logo, QR illustration, and card as JPEG files. Dependencies retain their own licenses. The source code uses the [MIT License](../../LICENSE). Supplied images and logos are excluded from that license grant.

See [UI_MOCK_PLAN.md](../../specs/UI_MOCK_PLAN.md) for the adopted plan and [HACKATHON_CHANGES.md](../../specs/HACKATHON_CHANGES.md) for measured results.

## Wireframe based on the 2026-09-26 designs

[UI_WIREFRAME_PLAN.md](../../specs/UI_WIREFRAME_PLAN.md) maps the UI to the supplied designs. The local version supports the central card, input, registration review, simulated approval, processing, and completion flow. This wireframe was deployed to the public URL above on 2026-09-26.

## Supplied assets

The assets were incorporated into the local UI on 2026-09-26. The [asset inventory](../../specs/assets/asagohann777/README.md) maps originals to their old filenames.

| Display | Distributed asset | Original |
| --- | --- | --- |
| Home | `public/assets/home-background.jpg` | `backgrounds/garden-mountains-02.jpg` |
| Other screens | `public/assets/flow-background.jpg` | `backgrounds/waterfront-platform-04.jpg` |
| Shared logo | `public/assets/logo-ja.jpg` | `logos/shomeikun-qr-proof-ja.jpg` |
| Home QR illustration | `public/assets/qr-scan.jpg` | `illustrations/qr-scan.jpg` |
| Shared card | `public/assets/trading-card.jpg` | `cards/shomei-ichiro.jpg` |

The JPEGs were copied without changing the originals. CSS crops the logo margins and checkerboard around the card. Both languages use the Japanese logo, with localized alternative text. A QR code for the existing demo URL overlays the card's lower-right corner. The home QR image is the supplied illustration; the scan button starts the action.

The build and existing Chromium and WebKit flow checks passed. After the final home-screen adjustments, image loading and horizontal overflow were checked at 320px and 390px. The background and logo integration was deployed on 2026-09-26.

## Preview the registration animation

Open `http://localhost:4173/?scenario=registering` locally or select the registration animation from the menu. The preview repeats the floating card, perimeter light, glowing cube, platform light, and rotating lower ring. It creates no transaction and does not advance to completion automatically. The normal registration flow finishes after the existing mock processing delay.

With reduced motion enabled in the OS or browser, these animations stop while the layout and registration status remain visible. The card shares the existing `tradingCard()` function. Replace backgrounds and cards as described above.

The button styling and registration animation were also deployed on 2026-09-26.

## Scan-screen appearance and motion

The scan screen has translucent status and circular buttons, photo and lightning icons, glowing corners, and a moving scan line. Reduced motion fixes the scan line in the center and stops the corner pulses and reading ring. In mock mode, photo and light controls open explanations without using device functions. This change was deployed on 2026-09-26.

## Select API and wallet modes

The default `npm run build` and `npm run dev` use mock API and wallet behavior. UI design work needs no extra settings.

| Environment variable | Default | Live setting |
| --- | --- | --- |
| `UI_API_MODE` | `mock` | `live` |
| `UI_WALLET_MODE` | `mock` | `metamask` |
| `UI_API_BASE_URL` | None | Public API origin |
| `UI_PUBLIC_URL` | UI mock URL | URL for shared cards and QR codes |
| `UI_SAMPLE_CARD_ID` | `connectivity-20260926-001` | Card ID opened by simulated scanning |
| `UI_RPC_ORIGIN` | None | Real wallet RPC origin, allowed by CSP |

Values are fixed at build time. `.env.example` lists settings; the UI does not load `.env` automatically. Set shell environment variables.

```sh
UI_API_MODE=live UI_WALLET_MODE=mock \
UI_API_BASE_URL=https://shomei-kun-integration.dptr.workers.dev \
UI_PUBLIC_URL=https://shomei-kun-integration.dptr.workers.dev/ui/ \
npm run build:integration
```

`live/mock` is read-only. `mock/metamask` causes a build error. Live mode hides scenario switching and simulated approval. Camera behavior remains simulated unless live camera mode is configured separately.

Both builds share the UI source in this directory. `apps/web/scripts/prepare-integration-ui.mjs` builds this source into `dist-integration`, then bundles it in the API app's `public/ui` for the dedicated Worker. Do not pass admin keys to the UI. See the [procedure and measured results](../../specs/UI_LIVE_CONNECTION_REPORT.md).

```sh
npm test
# Serve live/metamask on port 4174 and live/mock on port 4175 before running.
LIVE_READONLY_UI_URL=http://127.0.0.1:4175 node scripts/verify-live-ui.mjs
```

`verify-live-ui.mjs` is a browser test with substituted API responses and EIP-1193 behavior. `verify-live-chain.mjs` is a manually run script that sends real transactions using an explicitly supplied dedicated key. It is excluded from normal tests. That script also does not replace physical-phone MetaMask testing.

To check SDK initialization in the served bundle without injecting a real wallet, run `node scripts/verify-metamask-sdk.mjs`. It checks the MetaMask launch link and start of the relay connection at a dedicated URL, then stops before switching to the app. It sends no transaction.

## Additional approval and review designs

The designs received on 2026-09-26 led to changes to registration review icons, consent text, card size, and the wallet approval information panel and reject button. From `?scenario=unregistered`, proceed to the next step, connect the sample wallet, and proceed again. After consent, the registration action opens approval. In live mode, approval takes place in MetaMask. Checks covered Japanese, English, 320px, 390px, Chromium, and WebKit. These changes were deployed to the public UI mock on 2026-09-26.

## Select the camera mode

The default `UI_CAMERA_MODE=mock` keeps sample scanning and does not request camera permission. Enable real camera and photo QR reading through a build-time variable:

```sh
UI_CAMERA_MODE=live npm run dev
```

`.env.example` is a settings example, not an automatically loaded file. `UI_API_MODE` and `UI_WALLET_MODE` are independent. With only the camera in live mode, scanning an ID opens a mock unregistered card. Combine the existing live settings to use the real API as well. Rebuild after changing settings.

Use the camera on HTTPS or localhost. A phone may not be able to start the camera at a LAN HTTP address. If you cannot grant camera permission, use the photo option. Images are not uploaded. The light control appears only on supported devices. After hiding the tab, use the resume action to restart.

Accepted QR codes are `UI_PUBLIC_URL` with `?cardId=...`, and the configured API's `/api/v1/cards/{id}` URLs. Any path in the public URL must also match. API mock mode also accepts the earlier `?scenario=registered` format. See the [camera specification](../../specs/CAMERA_SCAN.md).

```sh
npm test
# Requires Chromium, WebKit, and ffmpeg.
npm run verify:camera
```

Browser tests use real QR images and virtual camera video. Check the actual camera and light separately on iPhone and Android devices.

## Prepare MetaMask

On iPhone and iPad external browsers, use the MetaMask open action to open the same card in the app's browser. If that fails, copy and paste the card URL. Inside MetaMask, the preparation action connects the wallet and adds or switches the network. Other external browsers use the SDK and check connection status after returning. See the [demo guide](../../specs/DEMO.md).

In normal mock/mock mode, preview `?scenario=wallet-connect`, `wallet-add`, `wallet-switch`, `wallet-paused`, `wallet-rejected`, and `wallet-ready`. These do not run real preparation. Live/mock remains read-only.

`node scripts/verify-wallet-preparation.mjs` drives the mock UI on port 4273 and live UI on port 4274 with synthetic wallet and API behavior. Override the URLs with `MOCK_BASE_URL` and `LIVE_UI_URL`. It simulates app switching and does not verify a physical iPhone round trip to MetaMask. See the [connection preparation plan](../../specs/METAMASK_PREPARATION_PLAN.md).

## Search by ENS or wallet address

Live mode adds an optional ENS name or address search action below QR scanning. It resolves Sepolia names and finds cards registered to that wallet on Curvegrid Testnet. Direct wallet addresses skip ENS resolution. ENS is optional and does not restrict new demo cards to a wallet. See [ENS integration](../../specs/ENS_INTEGRATION.md) for API setup, pagination, errors, and browser checks.

Mock mode also exposes this search UI. Open `/?preview=ens` or use the secondary home action. `shomeikun.eth` returns sample cards with pagination, `empty.eth` returns no cards, and `error.eth` shows an upstream error. Other valid names show the unresolved-name state. Results are fixtures; no API, ENS, or wallet requests are made. Selecting a sample card opens the existing registered-card view.
