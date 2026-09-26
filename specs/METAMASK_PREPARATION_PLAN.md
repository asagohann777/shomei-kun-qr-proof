English | [日本語](METAMASK_PREPARATION_PLAN.ja.md)

# MetaMask connection preparation and app return

2026-09-26. User-approved plan on branch `feat/test-card-batch`. Merge latest main `0a59574` and publish to the dedicated integration environment. Do not change the UI mock Worker.

## Experience

Start connection, network addition, and switching from **Prepare with MetaMask** on the registration screen. Before switching apps, instruct users to return after approval. On return, recheck the connection and show **Continue in MetaMask** if another approval is needed. Do not repeatedly open another app automatically.

Show Curvegrid Testnet before connection. Display connection, addition, switching, and ready states only in the wallet area. Treat a different network as normal preparation. Connection rejection or network failure must not become a registration failure screen. Troubleshooting includes opening the same card in MetaMask's browser and copying manual settings.

Retain the existing card, background, white #ffffff, pale blue #eaf4ff, text #080e48, action #0068f5, success #24734d, and border #dce4ed. Use left alignment, the existing system font, 14px body text, 16px buttons, and tap targets of at least 44px. Keep guidance in the wallet area with the input and card, rather than adding a preparation screen. Match Japanese and English behavior.

## Implementation

- Safari/Chrome obtains permission with the SDK's default connection. Do not specify an unadded target chain in the initial connection. MetaMask's browser uses its injected provider.
- After connecting, check the chain and switch if needed. Add only on 4902, then recheck and switch if needed. Normalize code, rpcCode, and nested errors.
- Separate preparation from registration state. Reconcile on visibilitychange/pageshow and start no further requests while hidden. The 60-second threshold counts foreground time only. Timeout means awaiting a response, not cancellation. Do not stack pending requests.
- On reload, restore and check the SDK session. A saved stage alone does not establish connection. Preserve the card and nickname in the same browser.
- Log stages, request IDs, returns, and errors in diagnostics. Exclude secrets and RPC URLs.
- Reuse /api/v1/connection without changing the public API or contract. Preparation sends no registration transaction. Preserve mock and read-only modes.

## Acceptance and publication

Verify missing networks, other chains, ready state, rejection, pending requests, disconnection, delayed responses, account changes, app switching for over one minute, returning without approval, and mid-flow reload. Prevent duplicate requests and false completion. Render Japanese/English at 320/390px and desktop widths in Chromium/WebKit. Check images, overflow, and console output. Keep device results separate from automation. Do not claim verified iPhone support before physical-device testing.

iOS background suspension means consecutive MetaMask approvals and automatic browser return are not guaranteed. Do not reissue cards.

## Additional instruction during work

Remove test-card URLs, issuance records, and images from public Git history without reissuing cards. Move records to a private local copy and rewrite the unmerged PR branch. Future builds must exclude the public gallery. Preserve individual cards' chain records and existing URLs.

## History rewrite results and limits

Removed 12 card-record files from the unmerged PR branch's history and updated the PR description. They had not reached main. Confirmed that current public branch and PR merge/head references could not reach the records. Kept a local copy and excluded the future private-card directory from Git.

The GitHub API could still retrieve old commits by SHA. Force push alone cannot fully delete GitHub's internal references or caches. [GitHub's removal procedure](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) limits Support assistance to sensitive data. Distinguish ordinary history removal from complete erasure. Card chain records are unchanged.

## Verification results

- All 74 UI unit tests passed, including connection, missing network, automatic switching on addition, rejection at each stage, external pending requests, 60 foreground seconds, long hidden waits, delayed responses, repeated actions, reload, and responses after disposal.
- Chromium 149 / WebKit 26.5 passed all existing mock flows and synthetic live branches. Confirmed no preparation on return to a registered card, no card DOM replacement during evidence refresh, and 503 display.
- Both browsers simulated app switching at connection/addition/switch stages. Confirmed explicit continuation after return, draft restoration in the same browser, and retained forms after connection rejection. Checked Japanese/English at 320/390/1365px, including images, horizontal overflow, fixed-footer overlap, and console output.
- Verified real MetaMask SDK dynamic loading, relay initiation, and app-launch links. Stopped before app launch, with zero registration API requests. Local verification proxied only public API GET requests through Node to isolate CORS.
- Passed the dedicated Worker build, type checks, environment-value removal, and known-credential checks. Four Worker cases covering missing live settings, CORS, and mock rejection passed.

[Preparation browser tests](assets/metamask-preparation/browser-results.json), [registration regression tests](assets/metamask-preparation/registration-results.json), [SDK launch tests](assets/metamask-preparation/sdk-results.json), [Japanese 390px](assets/metamask-preparation/390-preparation-ja.png), [English 320px](assets/metamask-preparation/320-preparation-en.png), [awaiting addition](assets/metamask-preparation/390-add-network.png), [ready](assets/metamask-preparation/390-ready.png). Cards and wallets in these images are synthetic fixtures.

The round trip from a missing network on physical iPhone Safari/Chrome/MetaMask was not tested. Automation is not a substitute for device verification.

## Dedicated integration publication

On 2026-09-26, deployed final Worker version `caadbc80-87ac-414f-9024-ed63342b7344` to the dedicated integration. The UI mock Worker was unchanged. [Public asset verification](assets/metamask-preparation/public-assets.json) matched all 24 JS/CSS/HTML files to the build. Connection API was ready, and two old gallery files returned 404. Individual URLs and chain records were preserved.

Rechecked real SDK launch on the public URL in both browsers, with zero registration API requests and zero errors. [Public SDK results](assets/metamask-preparation/public-sdk-results.json).

### Additional fixes after publication

A CSP-enabled app-return test found QR image CSP warnings when wallet updates rerendered the card. The hypothesis that screenshots caused them was rejected after reproducing the same behavior without capture. The browser initiator stack identified the render path. Updated only the wallet area while preserving the registration card and inputs. Without relaxing CSP, both browsers stopped warning and retained card/input DOM identity. [CSP-enabled tests](assets/metamask-preparation/csp-browser-results.json). Temporary stylesheet CSP warnings from WebKit screenshot processing were recorded separately. App errors were zero.

Tests at both the wallet boundary and preparation state confirmed that delayed reconciliation success/failure cannot overwrite a newly completed connection.

Preparation, return, and reload also passed on the public URL in both browsers, with zero QR CSP errors. [Public browser results](assets/metamask-preparation/public-browser-results.json). Switching to read-only mode does not restore a saved live registration form. With existing drafts in both browsers, confirmed no connection button, input field, or wallet initialization. [Read-only results](assets/metamask-preparation/readonly-results.json). Reproduce by setting `LIVE_READONLY_UI_URL` in `verify-live-ui.mjs` to a read-only build.

## Integration with parallel work

Rebased while preserving main `0a59574`'s live camera and home QR animation. Combined lazy camera initialization with preparation-draft restoration, then rechecked reloads in Chromium/WebKit. All 74 unit tests passed. The camera remains mock by default with independent `UI_CAMERA_MODE`. [Combined preparation tests](assets/metamask-preparation/combined-browser-results.json), [camera tests](assets/metamask-preparation/combined-camera-results.json).
