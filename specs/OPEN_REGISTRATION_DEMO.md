English | [日本語](OPEN_REGISTRATION_DEMO.ja.md)

# Allow anyone to register demo cards

2026-09-26. Following the user's correction, anyone can register an issued, unregistered demo card with their own wallet. The demo no longer requires a designated allowed address. Retain user-wallet signatures, issuer-only issuance, rejection of unissued cards, and rejection of overwrites or duplicate registration after the first registration.

A zero-address ABI `allowedWallet` permits everyone. Omitting `--wallet` from the issuer CLI makes issuance unrestricted. Keep the format readable for existing cards with designated addresses. The owner comes from `msg.sender`, never the zero address or an address entered in the UI.

The deployed contract cannot be changed. Deploy the revision at a new address with MultiBaas Library version 1.1.0 and switch the dedicated integration's registry. Do not delete or overwrite old registration records. Preserve past evidence with the old address. Reissue card IDs for existing unregistered manual URLs under the new issuance scope, and issue additional cards for multiple testers.

Alongside implementation, attach request IDs to API failures and allow copying the last 20 browser diagnostic events. Do not log API keys, RPC URLs, private keys, nicknames, or unsigned transaction bodies. Server logs can compare rejection codes, allowed addresses, and connected addresses. The connected wallet needs gas funds.

## Public URLs

- [Manual card](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=mobile-ui-20260926-manual)
- [Spare card 1](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=demo-open-001)
- [Spare card 2](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=demo-open-002)

The registry is `0x0721F6260a83577015F71a50BB46c09B5e15BcAA`, version 1.1.0, starting at block 18773. See the [deployment record](assets/curvegrid-connectivity/open-demo-deployment.json). Previously registered test cards remain at old registry `0xE226ABd4e3866568C7bd53a57f2CA4b619EFB47e` and were not moved to the API's new default registry.

The public API returned 200 for registration preparation from two different addresses. Automated tests found an old allowed-address comparison in post-registration verification. Preparation, events, and transaction verification were aligned to the same permission rule. After registration, the actual owner is also compared with the transaction sender.

Added **Copy error details** to browser failure screens. It copies up to 20 events containing the code, request ID, card ID, connected address, chain, transaction hash, and timestamp. If Clipboard is unavailable, text appears on screen. The server now logs 4xx responses as structured records, matched by response `X-Request-ID`. Cloudflare Observability was enabled on the dedicated Worker.

To inspect logs, run `npx wrangler tail --config wrangler.integration.jsonc --format json` in `apps/web`. Request IDs can also be matched in Cloudflare Worker Logs. Unrestricted demo cards do not produce WALLET_NOT_ALLOWED. Insufficient gas has dedicated guidance.

## Final verification

Published dedicated Worker version `c8456faa-b0d6-4e7b-a9c4-9d0862d8610b`. Registered `demo-open-check-2` with test address `0xf12904Ef7aBfD79b68dcCdc7b30cFDE2D6BEeeb8`, different from the previous manual card's allowed address. Transaction `0xf0b1133e12c01606a52783eb64179d8a2529f8fcd088f43ebd9f8cb3dc2b2362` became confirmed after one submission. Reload and viewing in a separate third-party browser succeeded. This is distinct from physical-phone MetaMask operation.

Saved [real registration results](assets/open-registration-2026-09-26/chain-results.json), [public API verification](assets/open-registration-2026-09-26/api-verification.json), [three unregistered cards and error request IDs](assets/open-registration-2026-09-26/manual-cards.json), and [screen tests](assets/open-registration-2026-09-26/browser-results.json). Passed 70 API tests, 43 UI tests, 17 contract/CLI tests, type checks, OpenSpec strict validation, and secret checks. Verified diagnostic copy and errors at 320, 390, and 1365px in Chromium/WebKit.

## Registration preparation for a zero-balance wallet

Following the user's request-ID report `8a68ed80-3b6b-46f3-9c00-12a50dfb6952`, reproduced a zero balance at connected address `0xc22d961e56b70a73f6dcb1ec0a47b7da1fe38fdd` and MultiBaas HTTP 400 `insufficient funds for transfer`. The old API converted all upstream 400 responses to 503. Now only this register response becomes 422 `INSUFFICIENT_FUNDS`. Other 400 responses remain upstream failures. Updated OpenAPI and generated validators.

Saved [reproduction results](assets/gas-diagnostics-2026-09-26/upstream-reproduction.json), [screen tests](assets/gas-diagnostics-2026-09-26/browser-results.json), and [320px guidance](assets/gas-diagnostics-2026-09-26/320-insufficient-funds.png). Insufficient balance during preparation makes no wallet submission request and creates no transaction. After funding, users can return to registration details and retry. Passed 71 API tests, 43 UI tests, Chromium/WebKit checks, type checks, and builds.

Fund the connected address through **Blockchain → Faucet → Request 1 ETH** in the MultiBaas dashboard. This ETH is for Curvegrid Testnet. A balance on another chain cannot be used. This diagnosis did not send funds to the user's address or register an owner.

Fixed Worker version: `f129bacf-35e0-47a4-9c0c-9478aed0bf6a`. Confirmed the [public API's 422 response](assets/gas-diagnostics-2026-09-26/public-api-result.json) for the same zero-balance address.
