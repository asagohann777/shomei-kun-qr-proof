English | [日本語](UI_LIVE_CONNECTION_PLAN.ja.md)

# Connect the latest UI to the API and wallet

2026-09-26 JST. The user requested API/signing integration with latest main UI while retaining mock mode through environment variables. The earlier UI ownership boundary changes only for this integration. Work in the existing PR #1's dedicated worktree without changing the original workspace. Base on latest origin/main `3598094`, since local main is older `3f1287e`.

## Sequence and boundaries

1. Review existing templates, the public API, and official MetaMask APIs.
2. Design modes, registration state, and API/wallet boundaries.
3. Divide independent API/registration and wallet work, then integrate shared templates/builds last.
4. Run mock screen checks and browser tests of live branches.
5. Publish the same UI at the dedicated integration URL and record measured behavior separately from remaining device checks.

Separate write destinations during parallel work. Preserve design CSS and existing mock interactions, placing API/wallet logic in separate modules. The parent integrates shared package/lockfiles, app templates, and deployment settings.

## Modes

| UI_API_MODE | UI_WALLET_MODE | Behavior |
| --- | --- | --- |
| mock, default | mock, default | Existing screen scenarios. No external calls or real wallet initialization |
| live | mock | Read-only real cards. No registration submission or fictional success |
| live | metamask | Real API and user-wallet approval/submission of registration transactions |
| mock | metamask | Build error. Never ask users to sign a fictional transaction |

Public build settings contain only modes, API origin, public UI URL, sample card ID, and RPC origin for CSP. Reject missing live origins and invalid modes. Exclude API keys, private keys, and admin RPC. Do not replace API failures with mock data. Normal UI-review build/deploy stays mock. A separate integration build bundles UI assets into the existing API Worker.

## Actions and state

Card URLs use `?cardId=...`. QR codes point to the same card's verification URL. Public reads require no wallet connection. Without a card ID, the scan button enters the simulated camera screen and the live build reads a sample card through the real API. Real camera capture remains out of scope here.

For registration, compare the connection API's chain/contract with the user's wallet/chain. Nicknames are 1–96 UTF-8 bytes with no trim or normalization. After consent on review, call prepare, verify ABI/from/to/chain/value/cardId/nickname, and reread wallet/chain immediately before signing.

Separate unsent, preparing, awaiting approval, hash obtained, confirmed, rejected, reverted, and unknown states. A network failure or page exit before the hash is unknown and must not automatically resend. After receiving a hash, save origin/chain/contract/card/hash/nickname. Reload and return resume only queries. Account/chain changes invalidate review and consent. Delayed responses cannot overwrite another card.

Use [MetaMask Connect EVM](https://docs.metamask.io/metamask-connect/evm/quickstart/javascript/) rather than the retiring SDK. Let the SDK handle external mobile-browser connection and app launch. Extension/in-app providers share the EIP-1193 boundary. No separate personal-signature login is needed. Request a signature for the registration transaction.

## Verification

- Mock builds make zero external requests or wallet initializations. Preserve scenarios and Japanese/English.
- Live API with mock wallet allows viewing only, without signatures.
- Test API errors, wrong chain/wallet, rejection, account/chain changes, repeated taps, hash restoration, unknown results, and card switching.
- Reject tampered unsigned API transactions in the browser.
- Check images, horizontal overflow, fixed-element overlap, and console errors at 320px, 390px, and desktop widths in Chromium/WebKit.
- Verify real card information in the public integration UI. Test-provider automation does not prove physical-phone MetaMask success.
- Phone signing needs the issuer-authorized user's test address and gas funds. Do not request private keys.

## Design comparison

Option A connects a dedicated live controller to existing templates. Option B extracts a runtime shared by mock/live. Compared impact on parallel design work, isolation from mock success, resume behavior, mobile support, and public API size. An independent review also selected A. Do not extract the entire renderer. Adopt B's API-mode checks, delayed-hash storage on the original attempt, per-card Web Lock, and CSP destination restrictions.

The parent owns shared templates/build/public configuration. Independent owners handle live controller/tests and MetaMask boundary/tests. Do not edit shared files concurrently. Some default models named in the requested skill were unavailable, so available models produced candidates and the independent assessment.
