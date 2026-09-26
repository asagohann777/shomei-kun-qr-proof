English | [日本語](APPLE_METAMASK_BROWSER_PLAN.ja.md)

# Register inside MetaMask on iPhone and iPad

2026-09-26. The user reported that switching from Safari to MetaMask showed only the home screen and failed with `REQUEST_EXPIRED`. Logs had no connected address or chain and had not reached network addition. The cause of the app not handling the connection request is unidentified. The user proposed MetaMask's browser and requested the same behavior on iPad.

## Decision

In live mode, show **Open in MetaMask** on the unregistered-card review screen in external iPhone/iPad browsers. Open MetaMask's official `https://link.metamask.io/dapp/{url}` as a regular link with the same public URL and card ID. Do not start a connection request in the external browser. Enter the nickname after switching. Do not automatically resume the SDK from a saved connection draft.

Detect iPad through its User-Agent, or a Macintosh User-Agent with multiple touch points. An available MetaMask provider indicates the in-app browser. Use the existing connection, addition, and registration flow without another app-opening link. Preserve mock/read-only modes and ordinary Mac behavior. Do not require switching apps to view a registered card.

Keep the white, pale-blue, and blue buttons, typeface, card, and centered layout. Change the review screen's next action to opening the app, without adding a screen. Do not instruct users inside MetaMask to return to Safari.

## Verification

Unit-test iPhone, iPad, desktop-mode iPad, ordinary Mac, MetaMask provider, mock, and read-only cases. Render Japanese/English at 320/390/1365px and iPad 820px in Chromium/WebKit. Check the card ID in the app link, no SDK startup, and connection through a MetaMask provider. Automated tests stop before launching the real app, so physical-device link handling and completed approval remain unverified.

## References

Reviewed [MetaMask's supported platforms and dapp links](https://docs.metamask.io/metamask-connect/supported-platforms/). External and in-app browsers have separate storage, so nicknames and connection sessions must not appear in URLs.

## Implementation and publication results

All 76 unit tests passed. Chromium/WebKit simulated iPhone and desktop-mode iPad, verified links to the same card, no saved SDK-session resume, and connection when a MetaMask provider exists. Rendered Japanese/English at 320/390/1365px and iPad 820px, checking images, overflow, and action positions. There were zero app console errors. Only temporary stylesheet CSP warnings during WebKit capture were excluded, consistently with existing tests. [Test results](assets/apple-metamask-browser/results.json).

Published integration Worker version `77d732e4-0ad2-424c-88ad-bd6466962351`. All 24 public JS/CSS/HTML assets matched the build. Live/mock camera switching was preserved.

The same checks passed on the public URL in both browsers. [Public results](assets/apple-metamask-browser/public-results.json). App-link navigation was stopped immediately before launch and is distinct from physical-device verification.

## Reinvestigation after a device report

The user again reported that the app opened without its browser. The assumption that a correctly generated HTTPS link would make the app handle the destination did not hold on the device. Separate the verification stages.

| Stage | Confirmed | Unverified or failed |
| --- | --- | --- |
| App web UI | iPhone/iPad detection and card-ID link generation | None |
| Safari-to-OS handoff | MetaMask launched on the user's device | Full URL delivered to the app cannot be inspected |
| MetaMask link handling | Official source passes dapps to its browser | User's device stopped on the home screen |
| Automated browser test | href and click verified | Stops before real app launch, so cannot detect this failure |

MetaMask's official `parseDeeplink.ts` normalizes `metamask://` to `https://link.metamask.io/`, and `handleDappUrl.ts` passes the URL to the browser. Switch to this direct scheme. Do not claim the internal app cause has been identified or fixed. If opening fails, provide the same card's HTTPS URL for copying into the in-app browser. If Clipboard fails, retain a read-only field for manual copying.

References: [official link parsing](https://github.com/MetaMask/metamask-mobile/blob/main/app/core/DeeplinkManager/utils/parseDeeplink.ts), [official dapp handling](https://github.com/MetaMask/metamask-mobile/blob/main/app/core/DeeplinkManager/handlers/intent/handleDappUrl.ts).

Published the direct-scheme version as `f356b57a-c981-4ce6-975d-9d5e0d4f7a21`. All 76 unit tests passed. Chromium/WebKit verified direct-link clicks, card URL copying, iPad detection, and in-app connection. All 24 public assets matched the build. [Direct-link results](assets/apple-metamask-browser/direct-link-results.json). Physical-device browser launch remained unverified.

## User device confirmation

After publication, the user reported that it opened, confirming MetaMask's browser launch. The device type was not specified. This does not establish success on both iPhone and iPad or completion of registration.
