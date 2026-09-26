English | [日本語](REGISTRATION_STATUS_UI.ja.md)

# Registration and refresh display

2026-09-26. This change targets the mobile live UI. Treat initial registration and subsequent reads as separate states.

## Display plan

Keep the existing Shomei Ichiro card prominent. Retain its image, owner information, and screen title during refresh. Limit changes to the status within the information panel.

Use existing white #ffffff, background #eaf4ff, text #080e48, action #0068f5, confirmed #24734d, and border #dce4ed. Retain Arial / Hiragino Kaku Gothic ProN / Yu Gothic. Status text uses the existing body size, with only its heading bold. Center the card and screen heading. Left-align owner information and status text.

```text
       Registration complete
       Shomei Ichiro card
┌──────────────────────────────┐
│ Card ID / Owner / Wallet     │ ← Retained during refresh
│ ○ Checking                   │ ← Only this area updates
│   Owner information verified.│
│                   [Refresh]  │
│ [Registration details] [Home]│
└──────────────────────────────┘
```

Compared full-screen loading with local updates and chose local updates as requested. Add no decoration or warning panel. Present pending transaction indexing neutrally in blue, distinct from registration failure. Japanese and English must mean the same thing.

## Behavior

- Refresh uses GET only. Do not restart registration or clear existing content. Disable repeated taps.
- Keep previously fetched owner information after refresh failure. Show the failure and retry within the status area.
- After first submission, verify the transaction result, owner information, and evidence for up to 60 seconds.
- If the owner and transaction success are confirmed but evidence indexing is delayed, show registration completion with the evidence state after the deadline.
- If transaction success remains unconfirmed at the deadline, show an unknown result without resending.
- Preserve mock API/wallet switches.

## Verification

Control the controller clock to test the 60-second boundary and indexing delay. In browsers, verify retained content and local status during refresh/failure. Check 320px, 390px, and desktop images, horizontal overflow, and console output.

## Implementation and results

- Added a registration-independent `refresh` state and read operation to `prototypes/mobile-ui/src/live-registration.js`. Refresh checks card ID, issuer, contract, and owner. Mismatches or network failures do not replace existing information.
- Initial verification lasts 60 seconds from receipt of the submission hash. API timeouts also follow the remaining time. Confirmed transactions continue waiting if evidence is absent. At the deadline, show registration completion with neutral pending-indexing text. Unconfirmed transactions show an unknown result. Retry network failures within the deadline.
- `public/app.js` updates only `#evidence-status` during refresh. Browser tests verified retained card-image and owner-table DOM. Details dialogs use the latest information when opened.
- `public/live-messages.js` and `styles/input.css` add Japanese/English status text and a local spinner. Reduced-motion settings disable rotation.
- All 48 UI `npm test` cases passed, including waiting at 59 seconds, confirmed/unknown outcomes at 60 seconds, repeated-refresh prevention, failure recovery, and stale-response rejection after navigation.
- `scripts/verify-live-ui.mjs` passed in Chromium and WebKit. Covered initial evidence wait, local updates, Japanese/English text, refresh failure, and updated details. At 320/390/1365px, there was no overflow or fixed-element overlap. No browser errors.
- Mock `npm run build` and `npm run verify` passed in both browsers. OpenNext build, embedded-credential check, and OpenSpec strict validation passed.
- Visually reviewed images and changed the refresh spinner to a clear ring. Retained existing card imagery, colors, and layout.

Verification images are stored beside the [browser results](assets/registration-status-2026-09-26/results.json).

Published to the dedicated Worker on 2026-09-26 as `362baa6a-7dd8-4210-a7d1-fb58a523bd73`. Signing, the public API contract, and the smart contract are unchanged. Boundary, delay, and network-failure tests used controlled fixtures and made no new real registration.

Confirmed real API reads of `demo-open-check-2` at the public URL. Tested deployed UI refresh with an evidence-pending fixture, checking retained card DOM and local status. [Public verification record](assets/registration-status-2026-09-26/public-check.json).

## Reloading registered cards

A remaining path returned to the registration-progress screen when reopening a card in a browser with saved registration history. Fixed `open` and return-time `recheck` as well as the refresh button.

Cards confirmed registered by the real API do not resume registration from saved history. Show checking while loading, then the registered card. Show the owner even while evidence is pending, and refresh within the status area. Submitted transactions for unregistered cards are still queried to prevent duplicate submission.

All 50 UI tests passed. For registered cards with both available and pending evidence, verified no transaction query from saved history or page return, and no overwritten display from delayed previous queries.

## Integration with the latest UI

Merged main `e675119`'s backgrounds, logo, and card images. Resolved conflicts by retaining new images/backgrounds, dynamic real-API QR codes, and live-operation constraints. Preserved defaults `UI_API_MODE=mock` and `UI_WALLET_MODE=mock`. UI work can use `npm run dev` without settings in `prototypes/mobile-ui`. Live read-only and MetaMask modes still require explicit configuration.

Before merging, API checks found zero GitHub Actions workflows, zero repository rulesets, and a 404 for main branch protection. Cloudflare Workers Builds API returned no build triggers for either `shomei-kun-ui-mock` or `shomei-kun-integration`. Merging and manual dedicated-integration deployment are separate actions.

After integration, 50 UI tests, live-fixture/default-mock Chromium/WebKit flows, OpenNext build, secret checks, and OpenSpec strict validation passed. Reviewed 320/390/1365px images. Deployed dedicated Worker version `d105e655-2dcd-456a-bb18-39dcf05285c1`, prepared saved history for a real registered card, and reloaded it. Neither registration-progress display nor transaction requery occurred. No new registration transaction was sent.

[Integrated browser results](assets/registered-read-2026-09-26/results.json), [mock results](assets/registered-read-2026-09-26/mock-results.json), [public read results](assets/registered-read-2026-09-26/public-check.json).
