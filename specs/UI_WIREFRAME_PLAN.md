English | [日本語](UI_WIREFRAME_PLAN.ja.md)

# UI wireframes based on the supplied designs

Requested on 2026-09-26 for the discussion mock in `prototypes/mobile-ui`. Implement after image-storage commit `164a180`. The initial scope excludes backend integration and updating the public version. A later instruction authorized publishing the UI mock.

## References and direction

Follow the [author's designs](assets/asagohann777/2026-09-26/README.md), centering the card and short action results. Keep text out of images so backgrounds/cards can be replaced independently later. Unregistered state uses blue text on white. Reserve the background with flat pale blue until city, water, and light assets arrive.

Use ink `#080e48`, action blue `#0068f5`, sky `#eaf4ff`, lines `#b5cfee`, white `#ffffff`, and success green `#16804a`. Japanese uses Hiragino Kaku Gothic ProN and Yu Gothic, with Arial for Latin characters/numbers. Headings are 24–28px; inputs are at least 16px. Center headings/cards and left-align input labels and review tables.

```text
Back           Shomei-kun / QR Proof           Menu
                      Short heading
                       Card asset
              Information, inputs, review table
                       Main action
```

Only the input screen puts the card first, followed by a white panel with the heading and two input details. The review screen has the card, a nickname/wallet/card-ID table, and register/edit actions. Processing shows the card, progress, and a short state message. Completion shows a checkmark, heading, card, registration table, and details/home actions.

Compared the existing owner-first horizontal layout with the supplied design and chose the vertical centered layout. The fixed footer conflicts with in-panel actions, so use normal document flow. Short phone screens can scroll.

## Behavior and assets

- Allow scan, scan result, owner input, registration review, approval, processing, and completion interactions.
- Move publication consent to registration review. Preserve simulated wallet connection and approval.
- Preserve Japanese/English switching, reload state, failure/unknown states, and wrong connection cases.
- Group language and discussion-state selection in the menu. Keep a short persistent notice that the mock does not register anything.
- Use the existing SVG as temporary card art. Do not substitute whole-image screenshots or crops for UI implementation.
- Use the design's `TC-001` as the displayed mock ID. Do not change real API card-ID requirements.

## Verification

Storage and hash comparison for 12 images were completed in the image commit. Check builds, Japanese/English at 320/390/430px, the full registration flow, return to editing, consent, abnormal states, and reload. Document asset replacement locations and results in the README and change log.

An additional instruction removes the entry-screen note about scanning the card's lower-right QR, including its English counterpart.

On 2026-09-26, an additional instruction authorized committing, pushing, and deploying the completed wireframe to existing UI mock `shomei-kun-ui-mock`. API app deployment is excluded.

## Button appearance

Additional request on 2026-09-26. Use CSS to match the design's blue primary actions, white secondary actions, and circular tools. Primary actions use a gradient from `#008cf5` at the top to `#0055ed` below, a thin `#bcefff` light edge, and a white `#ffffff` inner highlight. Secondary actions fade white to `#edf5ff`, with `#1261b3` text. Keep text size and layout. Place next/register arrows at the right edge.

Concentrate gloss and faint outer light on primary actions. Use thin borders and small shadows for secondary, back, and menu buttons. Do not give every button equal glow. Use darker blue text on small primary actions. Disabled buttons lose gloss/shadows while pressed feedback and keyboard focus remain. No image assets are needed.

## Registration animation

Additional request on 2026-09-26. Reference: [registering design](assets/asagohann777/screens/registering-ja.jpg). Arrange cubes above and beside the central card, QR/wallet below, an elliptical base, and a lower ring with a link symbol. Use blue `#0068f5`, dark blue `#073ab8`, cyan `#7cecff`, white `#ffffff`, and background `#eaf4ff`. Retain heading font and center alignment.

Slowly repeat card bobbing, moving perimeter light, light from the base, and link-ring rotation. Choose a composition showing the card/QR/wallet relationship rather than a larger spinner. Do not rotate text or the card itself. Show no percentage. Never delay actual state transitions for animation.

Keep existing simulated processing times in the normal flow. Add a registration-animation scenario for extended inspection. This preview creates no transaction and does not complete automatically. Reduced-motion settings stop rotation, movement, and flashing while preserving the composition and state text.

## Scan-screen appearance and motion

Additional request on 2026-09-26. Reference: [Japanese scan design](assets/asagohann777/screens/qr-scan-ja.jpg). Use a translucent white status pill and white circular photo/help controls with blue icons. Colors: white `#ffffff`, pale blue `#e4f0ff`, cyan edge `#bcefff`, action blue `#0068f5`, scan light `#63edff`, and navy text `#080e48`. Keep text sizes and overall layout.

Use a rotating ring to the left of the scanning status, landscape SVG for photos, and lightning SVG for light. Add thick blue corner frames, light along the top, and a cyan scan line moving within the frame. Avoid strong full-screen flashing. Reduced motion stops the line and ring, retaining a central line and frame.

The scanning indicator remains a status, not a button. Photo/help/light controls open existing mock explanations. This work still uses no real camera, photo decoding, or device torch.

A further instruction keeps the preview area but reduces the centered guide to 72% width/height. Keep the scan line near the frame and size the sample QR to 58% inside it.

## Scan-result appearance

Additional request on 2026-09-26. Match the design's glossy blue sphere, white checkmark, and faint outer light. Give the Shomei Ichiro information panel a white/pale-blue translucent face, white border, and inner highlight for glass-like depth. Retain the white unregistered pill and blue text with subtle depth. Use existing blue/white/pale blue and preserve text, layout, and actions. Keep this distinct from the green completion checkmark.

A further instruction moves the translucent face, white edge, and inner highlight into shared `.info-panel`. Use the same appearance for scan results, owner input, registration review, wallet approval, and registered/completed screens. Preserve each screen's layout and spacing.

## Supplied assets

2026-09-26. Use `garden-mountains-02.jpg` on the initial screen and `waterfront-platform-04.jpg` elsewhere. Colors are white #ffffff, navy #080e48, action blue #0068f5, cyan #7cecff, and pale blue #eaf4ff. Retain Arial/Hiragino fonts and use the supplied logo image.

Center logo, QR illustration, and scan button on the initial screen. Keep the smaller logo, result, card, information panel, and next action on flow screens. Compared a full landscape with opaque information panels and chose to retain the landscape beneath a white veil around headings. Use the original design's water, blue light, and metallic appearance without more decoration or explanation.

Blend logo/QR white backgrounds with CSS multiply. Hide the card checkerboard through its display frame without modifying the original image. Only a Japanese logo was supplied, so use the same brand image in English UI with localized accessible text. Distribution copies are in `prototypes/mobile-ui/public/assets/`.

### Scrolling background and card composition fixes

A background rendered at 850px high stopped partway down long screens. Render it in a fixed pseudo-element centered at at most 480px wide, while only the body scrolls. Display the 940×1290 region starting at 120,20 in the 1180×1333 original card. Put QR in the same crop frame, covering a 200×200 region starting at original coordinates 770,982. Calculate percentages from this coordinate system rather than retaining old SVG spacing.

## Revised approval and registration-review designs

Received on 2026-09-26. Follow the [approval screen](assets/asagohann777/screens/wallet-approval-ja-01.jpg) and [registration-review screen](assets/asagohann777/screens/registration-confirm-ja-02.jpg).

Use white #ffffff, navy #080e48, action blue #0068f5, field-icon blue #1483ce, and pale blue #dceafb. Keep Arial/Hiragino, 22–28px headings, 14–16px body text, and 12–13px supporting text. Retain centered composition and left-align the table and consent.

```text
Registration review             Wallet approval
    Heading                         Blue wallet symbol
    Card                            Heading
┌ Translucent panel ┐                Short explanation
│ Review details    │           ┌ Translucent panel ┐
│ Person / name     │           │ Name/address/ID   │
│ Wallet / address  │           └───────────────────┘
│ Tag / ID          │                Reject
│ □ Public details… │                Approve
│   Cannot change…  │
│   Register        │
│   Edit            │
└───────────────────┘
```

Choose the design's smaller card and two-level bold/supporting text over the existing large card and one-line consent. Keep all three fields in one panel rather than separate cards. Person/wallet/tag icons appear only in the registration-review table. Use a blue outlined pill for the approval screen's reject action. Keep text/actions out of images and preserve language switching, consent, and values.

Live approvals occur in MetaMask, so add no simulated approve/reject controls in live mode. Apply the approval screen's visual style to live mode too. Preserve the fixed background and card QR coordinate system.

## Remove the home button and fix the logo frame

2026-09-26. At the user's request, removed **Back to home** from registered/completed screens and made registration details a single-column action. Retained the header logo link. The old fixed-pixel logo crop hid bottom text. Display the 940×505 region starting at 160,410 in the 1236×1272 original with its aspect ratio. Share these coordinates between initial/flow screens and fit the header's center column on narrow screens.
