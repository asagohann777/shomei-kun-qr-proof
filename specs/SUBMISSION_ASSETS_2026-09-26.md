English | [日本語](SUBMISSION_ASSETS_2026-09-26.ja.md)

# Submission screenshots and image assets

2026-09-26 JST. Captured integrated main `5d3e676` at the user's request. Local and origin/main history integration had been pushed. Preserved the original 14 untracked files byte-for-byte.

## English screenshots

[Nine images](../docs/submission/2026-09-26/screenshots/) and [capture record](../docs/submission/2026-09-26/screenshots/capture.json). The sequence is home, QR scan, unregistered card, owner input, review, approval, processing, completion, and details.

Built the latest code with mock API, mock wallet, and mock camera. Used the actual Chromium UI to capture English screens at 390×844 CSS px, deviceScaleFactor 2, full page. PNGs are 780px wide, with height based on content. No image editing was performed. The Japanese brand logo remains as supplied.

These images are UI demonstrations, not evidence of real camera use, MetaMask, or blockchain transactions. The processing screen uses a stable preview state. Network and transaction details are existing mock values and do not prove a live connection. Visible demo labels were preserved.

The build passed. Visually checked all nine images for text/buttons, image loading, and absence of horizontal overflow. Capture produced zero pageerrors or console errors. App requirements and screen implementation were unchanged.

Recapture script: `prototypes/mobile-ui/scripts/capture-submission.mjs`. In that directory, run `npm run build` and `python3 -m http.server 4189 --directory dist --bind 127.0.0.1`, then run `node scripts/capture-submission.mjs` from another terminal with Node 22 or later.

## Supplied images

- [Icon](../docs/submission/2026-09-26/branding/shomei-kun-icon.png): `ChatGPT 画像 2026年9月25日 17_29_33.png`
- [Cover](../docs/submission/2026-09-26/branding/shomei-kun-cover.png): `ChatGPT 画像 2026年9月25日 17_29_12.png`
- [Original names, dimensions, and SHA-256](../docs/submission/2026-09-26/branding/manifest.json)

Assigned roles in the specified order, then copied and renamed the files. Originals remain in Downloads. No resize, crop, recompression, or image generation was performed. Copies matched originals byte-for-byte. Generation prompts, generation times, and publication licenses were not further verified. Dates in filenames are not treated as verified generation times.

## README references

Added only screenshot links to the root README. The specifications and README body were scheduled for another session and were unchanged. Relative paths for referencing the assets are:

- `docs/submission/2026-09-26/branding/shomei-kun-icon.png`
- `docs/submission/2026-09-26/branding/shomei-kun-cover.png`
- `docs/submission/2026-09-26/screenshots/`

The human chose English for submission, asset roles, and README scope. Codex wrote the capture script, captured and visually checked screens, copied/renamed files, compared hashes, and documented storage. The relationship of this work to the hackathon period is unconfirmed. The user requested commit/push, so this change includes screenshots, assets, storage records, and corresponding prompts. Deployment is out of scope.
