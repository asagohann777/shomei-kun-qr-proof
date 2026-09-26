English | [日本語](CAMERA_SCAN.ja.md)

# Camera scanning

## Configuration and accepted formats

Set `UI_CAMERA_MODE=mock|live` at build time. The default is `mock`. Invalid values fail the build. Configure it independently of API and wallet modes. Integration builds pass this public setting too. Images and video are analyzed only on the device and are never uploaded.

Live mode prefers the rear camera and automatically reads QR codes. It has no simulated-read button. **From photo** works without camera permission. Check torch support after startup before showing the control. Decode failures, denied permission, and missing devices show guidance and retry. Never replace them with mock success.

Accepted content:

- A URL with the same origin/path as `UI_PUBLIC_URL` and exactly one `cardId` parameter.
- `/api/v1/cards/{id}` on the configured `UI_API_BASE_URL`, without extra parameters.
- Only in mock API mode, the public UI's `?scenario=registered` represents the existing sample.

IDs use the existing API's `[A-Za-z0-9_-]{1,64}` format. Reject bare IDs, external URLs, duplicate parameters, and URLs containing credentials or fragments. Open the ID in the current app without navigating to the scanned URL. Mock API mode shows an unregistered card for that ID and keeps the displayed ID and card QR consistent. This is not evidence of ownership or registration. Live API mode passes the ID to existing card lookup. No API or contract changes are involved.

## Lifecycle

Manage camera states as stopped, starting, scanning, photo decoding, paused, and error. A session number and accepted-read flag prevent stale responses and double navigation. Immediately stop tracks and destroy the decoder on screen exit, successful reading, or page hiding. Wait for explicit resume after the page returns. Canceling photo selection is not an error. If hiding the page stopped the camera, show a resume button.

Within one startup session, retain the video element through language switches and status updates. A restart uses a new video element so delayed stops or permission responses from the old session cannot affect the new stream. `qr-scanner` also closes late permission-granted streams after its stopped-state check.

Pin `qr-scanner` to 1.4.2 and bundle the worker on the same origin. Allow `camera=(self)` and image/video/worker blobs only in live mode. Add no external CDN or `unsafe-inline`.

## Verification

In `prototypes/mobile-ui`, run `npm test` and `npm run verify:camera`. Check accepted URLs, video/photo decoding, duplicate detection, stop/restart, language changes, and zero permission requests in mock mode. Video tests use FFmpeg.

Check the public integration with `node scripts/verify-camera-public.mjs`. Tests replace API responses and verify that video/photo QR decoding sends the card ID to the API. Results are recorded in [INTEGRATION_CAMERA_PLAN.md](INTEGRATION_CAMERA_PLAN.md) and the [change log](HACKATHON_CHANGES.md).
