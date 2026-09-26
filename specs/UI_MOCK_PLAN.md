English | [日本語](UI_MOCK_PLAN.ja.md)

# Accepted mobile UI mock plan

On 2026-09-25, the user requested a UI mock for discussion with teammate Ojii-chan Convenience Store and instructed implementation. This document manually records decisions, including selected answers. It was not automatically collected by the response hook.

## Scope and completion criteria

Build an interactive portrait-phone mock in `prototypes/mobile-ui/`. Give owner information priority and show the card as supporting content. Completion requires interaction from unregistered through simulated connection, registration review, simulated approval, processing, and public verification. A public Cloudflare preview for team access is authorized within this scope.

Do not connect MultiBaas API, Amoy, MetaMask, the camera, or issuer CLI. Keep the live version's Next.js/TypeScript architecture in [ARCHITECTURE.md](ARCHITECTURE.md). Do not change existing PoC data or code.

## Screens

| Screen | Mock actions |
| --- | --- |
| QR scan | Initially show **Scan QR code**. Press it to enter a simulated camera, then **Read sample** to open the card. Do not start the real camera |
| Card/public verification | Registered owner, card image, ID, and state. Show registration entry when unregistered and evidence details when registered |
| Owner registration | Nickname, simulated wallet connection, publication explanation, and consent. Allow correction of wrong-wallet/wrong-chain states |
| Registration progress | Awaiting approval, submitted, checking, success, rejected, failed, and unverifiable. Keep simulated approval actions on the same screen |

Use bottom sheets for connection explanations, evidence, and discussion scenario selection. Add no issuer screen. Show the mock label and absence of real registration at the top of each screen.

## Technologies

Use Tailwind CSS 4 and daisyUI 5 for consistent buttons, inputs, dialogs, notifications, and progress steps. Use custom CSS only for screen-specific spacing/layout. Generate CSS at build time without an external CDN.

The mock consists of static HTML/JavaScript. Publish it separately as Cloudflare Worker Static Assets, without introducing the production server or authentication environment for UI review. Pin exact dependencies in [package-lock.json](../prototypes/mobile-ui/package-lock.json).

Create SVG card artwork and icons for this work. Generate the card's lower-right QR with `qrcode` from the public sample URL. Include no secrets or entered nickname.

## State and storage

Compared two options and chose one controller for scenarios and screen state. Avoid state scattered across screens and assign operation IDs to async work. Approval rejection means unsent. Unknown results after submission retain the existing operation ID, distinguishing rechecks from resends.

- Support Japanese/English. Choose the saved language, then browser preference order, then English. Save the language in localStorage.
- Save simulated input/progress in sessionStorage for reload within the same tab. Do not treat it as an actual chain record or cross-device sharing.
- After simulated submission, move to checking at about 0.9 seconds and success at about 2.4 seconds. Track the same operation after reload. These timings do not represent real confirmation speed.
- Use `?scenario=` to open registered, unregistered, unissued, unauthorized wallet, wrong chain, rejected, failed, unknown result, evidence pending, or information unavailable states directly.
- URLs share sample states only, never entered nicknames. Reopening in the same tab restores that tab's progress. Reselect through **Change view** to reset.
- Add no external links resembling actual transactions. Explicitly state that the contract is undeployed and transactions are simulated.

## Verification and review

Capture portrait layouts at 320/390/430px and the retained phone-width layout on PC. Use Chromium and WebKit to check overflow, missing images, console errors, and overlapping bottom actions. Verify Japanese/English, reload, registration entry, error recovery, and rechecking the same simulated transaction.

Save the verification script as [verify.mjs](../prototypes/mobile-ui/scripts/verify.mjs), with results and limits in [HACKATHON_CHANGES.md](HACKATHON_CHANGES.md). Browser emulation success is not physical-device or F01–F10 live-integration success.

## Input sources

- [UI mock request](../docs/prompts/2026-09-25/125036-918190-48ca6ede27f84394b07d6186373ac9dc.json)
- [Phone-only scope](../docs/prompts/2026-09-25/125119-330106-4c7a94f195a54dc0a24ccff0186b35ee.json)
- [QR scan screen feedback](../docs/prompts/2026-09-25/125732-642145-82127e9814aa4e14af0f7d4165026777.json)
- [CSS framework instruction](../docs/prompts/2026-09-25/130020-061223-9fe219d1b00246e7a8784a7f6e035947.json)
- [Implementation instruction](../docs/prompts/2026-09-25/130205-446117-8447935530bf484793684183266bc2da.json)

The selected answers prioritizing owner information, simulated QR reading, and sharing a public URL were manually recorded from the conversation. The hook does not collect selected answers or the AI plan body.

## Further screen and wording adjustments

An additional instruction on 2026-09-25 makes **Scan QR code** lead from the entry screen to the simulated camera. The user selected no real camera startup. Keep four screen types, switching within the scan screen's state.

The same day's unslop/frontend-design request prioritizes short text and removal of duplicate notes. Retain white `#ffffff`, navy `#172b4d`, blue `#2457d6`, light gray `#f3f6fa`, and green `#24734d`. Use OS fonts with Arial/Japanese Gothic fallbacks and only three text levels: heading, body, and supporting text.

Replace entry-screen explanation boxes with a card image and one action. On the owner screen, show nickname and registered wallet first, without a real-name-style badge. Remove the decorative shield and repeated explanations. Group the card and record evidence below and use left alignment.

```text
Entry                         Public verification
Check the card owner          Current registered owner  Registered
                              Nickname
  Card image                  Wallet
QR position                   Card image / Shomei Ichiro / ID
                              Registration evidence
[Scan QR code]                [Scan another card]
```

Keep the mock label, consent before publication, no-change/no-deletion notice, and limits on authenticity/physical-possession proof. Avoid repeating the same explanation everywhere. Move detailed implementation notes into this document.

Sources: [scan sequence](../docs/prompts/2026-09-25/133305-362290-1af42c9b40cd45918eead71b975ec28d.json), [simulated-camera selection](../docs/prompts/2026-09-25/133405-218861-0eaa93d1c4074fa89b1c3f9e037e3643.json), [wording/UI adjustments](../docs/prompts/2026-09-25/133453-350394-3efe7376916043b88b58fab38eab2445.json). These additional selected answers are also saved in hook JSON.

## Applying the 2026-09-26 designs

[UI_WIREFRAME_PLAN.md](UI_WIREFRAME_PLAN.md) takes precedence for the current local UI. It changes to a centered card, a registration-review screen, and actions inside panels. Retain the earlier owner-first, left-aligned layout and fixed footer as the original-plan record. The public URL was not updated at that stage. A later instruction authorized publication on 2026-09-26.

## 2026-09-26: Home QR animation

At the user's request, smoothly scale the home QR illustration and its white frame between 1 and 1.035 over a four-second cycle. Use CSS transform without moving surrounding layout. Stop for reduced-motion preferences.
