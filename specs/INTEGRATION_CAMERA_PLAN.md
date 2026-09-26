English | [日本語](INTEGRATION_CAMERA_PLAN.ja.md)

# Enable the live camera in integration

2026-09-26. The user requested testing the latest main camera implementation in integration.

## Approach

Latest main `0a59574` was already merged into the working branch. The camera was unavailable because integration was built with `UI_CAMERA_MODE=mock`. Rebuild the dedicated integration with `UI_CAMERA_MODE=live` and save it in local `.env.local`. Keep the mock default, API/wallet switches, and UI mock Worker. Do not change camera implementation.

## Results

Published Worker version `7a4a7673-a63b-465e-8cc8-a648561931fe`. All 24 public JS/CSS/HTML assets matched the build. Camera Permissions-Policy allowed self, and no camera request occurred before pressing the button.

Chromium decoded a QR from generated video using the real decoder, passed the card ID to the API, and ended camera tracks. WebKit decoded a photo QR after simulated camera denial. Both retained communication failures as failures and displayed refresh controls. Tests replaced the API with 503 responses and sent no issuance or registration transactions. Physical iPhone camera verification was not performed.

Reproduction script: `prototypes/mobile-ui/scripts/verify-camera-public.mjs`. [Public test results](assets/metamask-preparation/camera-public-results.json).

## Try it

Open https://shomei-kun-integration.dptr.workers.dev/ui/ , select **Scan QR code**, and allow the camera. Scan an existing card QR. If the camera is unavailable, use **From photo**.
