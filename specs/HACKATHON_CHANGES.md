English | [日本語](HACKATHON_CHANGES.ja.md)

# Hackathon change log

This log distinguishes work created during the event from [pre-existing work](PRE_EXISTING_WORK.md). The relationship between each work timestamp and the event's start time must be checked before assigning work to the event period.

## 2026-09-25: Initial development records

Whether this work falls within the event period is unconfirmed.

- The user specified the purpose, the policy allowing work without a worktree, the specification structure, and prompt-storage requirements.
- Codex created `AGENTS.md`, the initial documents in `specs/`, `docs/prompts/README.md`, and the setup prompt record.
- Codex created `.codex/hooks.json`, `.codex/config.toml`, `scripts/save_prompt.py`, and `tests/test_save_prompt.py`. AI assisted with configuration, implementation, and tests.
- No application functionality or existing code was ported.
- The request was saved manually in [bootstrap-request.md](../docs/prompts/bootstrap-request.md).
- All six tests in `python3 -m unittest discover -s tests -v` passed. The configured hook command ran in a temporary repository to verify body preservation, concurrent saves, invalid input, save failures, rejection of other repositories, and redelivery.
- Automatic execution in a session after trusting the Codex configuration is unverified. Trust the hook through the CLI's `/hooks`, then check that the next input is saved.

Future entries will record affected files, differences from existing work, human design, implementation, and review, AI tools and uses, related prompts, and verification commands and results.

## 2026-09-25: QR registration specification, design, and demo procedure

Whether this work falls within the event period is unconfirmed. This was documentation work only. No app, contract, or issuer CLI implementation, existing-code porting, commit, push, submission, or deployment was performed.

### Human requirements and decisions

- The user described the existing PoC and its functionality, QR-based registered-owner checks, the issuer CLI, F01–F10, screen requirements, and Japanese and English display.
- The user specified Next.js, TypeScript, Cloudflare, and Curvegrid Testnet.
- The user chose on-chain nickname storage, a demo independent of the existing PoC, transaction information, and an RPC verification procedure.
- The user corrected the initial PC-registration proposal to smartphone registration.
- The user reviewed the documentation plan and instructed, "Implement the plan." The resulting documents have not yet received a human review.

### Files and AI use

| File | Work by Codex |
| --- | --- |
| [SPEC.md](SPEC.md) | Expanded the initial document with roles, functional requirements, screens, states, Japanese and English display, and acceptance criteria |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Documented architecture, permissions, identification, records, minimal interfaces, data flow, technology choices, and unverified items |
| [DEMO.md](DEMO.md) | Drafted preparation, issuance, smartphone registration, viewing on another device, RPC verification, and verification-record procedures |
| [PRE_EXISTING_WORK.md](PRE_EXISTING_WORK.md) | Distinguished existing functionality described by the user from the new scope, recorded references, and noted that no reuse had occurred |
| [PLAN.md](PLAN.md) | Manually saved the accepted documentation plan from the conversation |
| [Manual decision record](../docs/prompts/qr-proof-decisions.md) | Saved sourced multiple-choice questions and answers and the smartphone correction that were absent from hook JSON |
| This change log | Recorded human decisions, AI work, source prompts, and verification scope |

Codex researched official websites and technical documentation, separately from inspecting the existing PoC. Discussion used `openspec-explore`; writing used `unslop` and `technical-writing`. Documents followed the accepted plan. No OpenSpec change or feature implementation was created.

### Related prompts

- [Initial functional requirements and documentation request](../docs/prompts/2026-09-25/121716-439190-2cd0d9f92aa8468588e7978b39382568.json)
- [Correction to smartphone registration](../docs/prompts/2026-09-25/122429-037897-c475cb8e8fd244c08302e2043f25f922.json)
- [Instruction to implement the plan](../docs/prompts/2026-09-25/122651-114438-1fe83e01648547c1a4e98d4f8cc0ec12.json)
- [Multiple-choice questions and answers](../docs/prompts/qr-proof-decisions.md)

The `source: codex:UserPromptSubmit` field and bodies of the three JSON records above were checked. The choice responses and accepted plan were recorded manually, not automatically. The earlier hook-unverified statement in "Initial development records" preserves the state at that time and is separate from verification of these three saved records.

### Verification

The documents were cross-checked against the accepted plan for smartphone registration, on-chain nicknames, separation from the existing PoC, public RPC verification, Japanese and English display, and one-time registration.

- `git diff --check`: passed.
- The Python static check below passed for seven documents, 32 local links and targets, F01–F10 definitions and their acceptance-criteria coverage, unique A01–A11 IDs, trailing whitespace, and final newlines.
- `git status --short --untracked-files=all`: confirmed that changes were limited to documents and prompt records. No files, including new files, were committed.

The static check can be rerun from the repository root with the following command. Mechanical requirement-ID checks do not establish that the content is correct.

```sh
python3 - <<'PY'
import re
from pathlib import Path
from urllib.parse import unquote

files = sorted(Path('specs').glob('*.md')) + [Path('docs/prompts/qr-proof-decisions.md')]
links = 0
for path in files:
    text = path.read_text()
    assert text.endswith('\n'), f'{path}: missing final newline'
    assert not any(line.rstrip() != line for line in text.splitlines()), path
    for target in re.findall(r'\]\(([^)]+)\)', text):
        if '://' in target or target.startswith('#'):
            continue
        name, _, anchor = target.partition('#')
        resolved = (path.parent / unquote(name)).resolve()
        assert resolved.is_file(), f'{path}: missing {target}'
        if anchor:
            headings = re.findall(r'^#{1,6} (.+)$', resolved.read_text(), re.M)
            assert unquote(anchor) in headings, f'{path}: missing anchor {target}'
        links += 1
spec = Path('specs/SPEC.md').read_text()
acceptance = spec.split('## 受け入れ条件')[1].split('## 未確認事項')[0]
for index in range(1, 11):
    fid = f'F{index:02}'
    assert len(re.findall(r'^\| ' + fid + r' \|', spec, re.M)) == 1, fid
    assert fid in acceptance, fid
for index in range(1, 12):
    aid = f'A{index:02}'
    assert len(re.findall(r'^\| ' + aid + r' \|', spec, re.M)) == 1, aid
print(f'PASS: {len(files)} documents; {links} local links; F01-F10; A01-A11; whitespace')
PY
```

Application behavior, physical smartphones, chain connectivity, contract tests, and deployment were not exercised. A01–A11 in the specification are future tests, not passing results.

## 2026-09-25: Switch to MultiBaas API access and Polygon Amoy

Whether this work falls within the event period is unconfirmed. The documentation entry above preserves decisions and verification at that time. This change takes precedence for the current chain and access method.

- The user checked the public accessibility of Curvegrid Testnet and specified Amoy with MultiBaas API as the main access method.
- Codex updated `SPEC.md`, `ARCHITECTURE.md`, `DEMO.md`, `PLAN.md`, and this log. App and CLI state reads, unsigned transaction construction, and receipt and event queries now center on MultiBaas API.
- The recording chain changed to Polygon Amoy. The documents specify chain ID 80002, test POL, Amoy RPC, and Polygonscan. MetaMask signs and sends registrant transactions; the CLI signs issuer transactions.
- The application API key stays server-side. External verification uses Amoy RPC and Polygonscan independently of MultiBaas.
- Acceptance criteria now cover API outages and event-indexing delays. Earlier choices and the first plan remain as history.
- Official documentation confirmed configuration values and API uses. Connection to a MultiBaas environment for Amoy, contract deployment, API behavior, and physical-device behavior remain untested. No app implementation, commit, or deployment was performed.

Related input: [Question about public accessibility and the API](../docs/prompts/2026-09-25/124052-021791-e097150dfc834db6b871cd0dbce92976.json) and [MultiBaas API and Amoy instruction](../docs/prompts/2026-09-25/124238-516565-940307cad70d42acbdf9ec9f2ebda8bc.json). Both hook JSON records' `source` and body were checked.

Verification: rerunning the Python command above passed seven documents, 35 local links, F01–F10, A01–A11, and whitespace checks. `git diff --check` passed. The specification, architecture, and demo procedure were cross-checked for the roles of MultiBaas API and Amoy and to confirm that Curvegrid Testnet was no longer described as the current recording chain. No live-service connectivity test was performed.

## 2026-09-25: Smartphone UI mock for team discussion

Whether this work falls within the event period is unconfirmed. This is a new mock in this repository and does not connect to the existing PoC's implementation, data, or publishing configuration.

### Human decisions and AI scope

The user requested a UI mock for team discussion, smartphone-only support, a QR scanning screen, and a CSS framework to reduce production cost. During planning, the user chose an owner-first layout, simulated QR reading, and a public sharing URL, then approved implementation. Sources are collected in [UI_MOCK_PLAN.md](UI_MOCK_PLAN.md). The `source` and body of five related hook JSON records were checked. Later instructions added a simulated camera after the scan button and shortened copy, removed notes, and adjusted the UI. Three additional hook JSON records are linked from the accepted plan.

Codex created HTML, JavaScript, translations, CSS, SVGs, build and browser-verification scripts, Cloudflare configuration, and the README in `prototypes/mobile-ui/`. npm generated the package-lock. AI compared two structures and selected a single controller with scenario state. A separate agent's comment review removed one unnecessary comment.

Codex updated `SPEC.md`, `ARCHITECTURE.md`, `DEMO.md`, `PLAN.md`, `PRE_EXISTING_WORK.md`, `UI_MOCK_PLAN.md`, and this log. Screen images are actual browser screenshots, not AI-generated mockups. The card illustration and icons are new SVGs created by Codex. They do not reuse existing-site images or photographs of real players.

### Implementation and publication

- Implemented four screens: QR scanning, card and public verification, owner registration, and registration progress. The QR entry button opens a simulated camera. Evidence, connection, and scenario selection are grouped in bottom sheets.
- Removed duplicate notes, a decorative shield, and explanation boxes, and placed the nickname and wallet first. Shortened registration, approval, and error copy, and used a standard consent checkbox.
- Used daisyUI 5.7.46 and Tailwind CSS 4.3.3. This does not count as a live Next.js and TypeScript implementation.
- Implemented Japanese and English switching, saved language, restoration of simulated input and process state in the same tab, and ten discussion scenarios.
- "Unknown result" rechecks the same simulated operation; "Approval rejected" returns to an unsent state. There is no actual signing, sending, or chain query.
- Published the [smartphone UI mock](https://shomei-kun-ui-mock.dptr.workers.dev/) as a new Worker after checking that its name did not conflict with existing Workers. Worker name: `shomei-kun-ui-mock`. Published version: `0f4b15c3-79d3-4715-a7c4-bd4e6fa82ce0`.
- Verified HTTP 200, a Permissions-Policy that disallows camera and microphone access, CSP, and noindex at the public URL. Sharing URLs and QR codes do not contain entered names or secrets.

### Verification

Used Node.js 22.23.1 and Playwright 1.61.1. `npm run build` passed. Local interaction checks passed in Chromium 149.0.7827.55 and WebKit 26.5. Verification scripts and commands are in the [mock README](../prototypes/mobile-ui/README.md).

Captured 320px, 390px, and 430px layouts and a smartphone-width layout on PC; also checked English at 320px and 390px. Automated checks covered horizontal overflow, missing images, and console errors, followed by visual screenshot review. The script also checks that the final content can scroll above the bottom controls.

Exercised simulated connection, public consent, registration, reload, input display, language persistence, initial language choice, wrong chain, rejection, error recovery, rechecking the same simulated transaction, pending evidence, unissued cards, and unavailable information. Every browser request during interaction was a same-origin GET, confirming no external API connection or submission.

Visual review found and fixed a bottom-button width conflict caused by daisyUI CSS layers. The default fallback font in WebKit on Linux did not render Latin letters or digits, so Arial was added as a fallback. Shared libraries for verification were downloaded to `/tmp` and referenced by a temporary WebKit launcher. The actual browser was started by bypassing the distribution script's library-path override and preflight check that inspected only system libraries. In normal environments, use the README's `playwright install --with-deps` command.

For the public version, minimal reproduction and dependency-source inspection confirmed that Playwright 1.61.1's WebKit screenshot code inserts a temporary `body {}` style element and causes a CSP warning. Only that specific screenshot-time message is counted separately as `playwrightScreenshotCspWarnings`; application-operation errors still fail verification. The delivered CSP was not relaxed.

Physical smartphones, real cameras, MetaMask round trips, MultiBaas API, Amoy, the CLI, and contracts remain unverified. This does not count as passing the live tests for F01–F10 or A01–A11. No commit or push was performed in this work.

Final public-version verification passed in Chromium and WebKit. Checks covered 320px, 390px, 430px, and PC widths, both languages, the scan-entry transition to the simulated camera, and registration. All seven public assets matched the local build byte for byte, and SHA-256 hashes were saved.

- [Run time, browsers, and delivered-asset verification](assets/ui-mock/results.json)
- [Scan entry](assets/ui-mock/scan-entry.png), [simulated camera](assets/ui-mock/camera-preview.png), [public verification](assets/ui-mock/registered-owner.png)
- [Owner registration](assets/ui-mock/registration.png), [approval](assets/ui-mock/approval.png)
- [WebKit simulated camera at 320px](assets/ui-mock/webkit-camera-320.png), [WebKit registration at 390px](assets/ui-mock/webkit-registration-390.png), [public verification at 430px](assets/ui-mock/owner-430.png), [English at 320px](assets/ui-mock/english-320.png)

There were zero application console errors during interaction. Seventy-two CSP warnings from WebKit's screenshot tool were recorded separately. The first asset comparison after publication found a mismatch; fetching the delivered assets again confirmed a match, and all checks then completed. Document targets, requirement IDs, whitespace, and JavaScript syntax were also checked.

## 2026-09-25: Save Ojiichan Convenience Store's in-progress designs

The user requested storage of nine images and a shared ChatGPT conversation as in-progress work by Ojiichan Convenience Store, GitHub ID `asagohann777`. Creation times relative to the event period are unconfirmed.

- Codex copied the [nine images](assets/asagohann777/2026-09-25/README.md) without changing their original names or contents, and recorded authorship, sources, and SHA-256 hashes. All nine saved files matched the originals byte for byte.
- Codex manually created a [prompt source record](../docs/prompts/asagohann777-design-2026-09-25.md). The shared URL could not load even in a browser, so its body was not retrieved. The storage-request hook record is distinguished from the external conversation body.
- The images were stored as work in progress. No adoption decision, image editing, or application integration occurred. Each image's AI contribution and license are unconfirmed.

The user later pasted the conversation text. Codex extracted and saved the [original conversation excerpt](../docs/prompts/asagohann777-design-2026-09-25-transcript.txt) from the related hook JSON. The body mixes user instructions and ChatGPT replies and was not edited. It was checked for exact agreement with the relevant part of the hook record. Fetching the shared URL itself still fails.

## 2026-09-26 JST: Detailed design for the fixed-mock Web API

The user selected mocked MultiBaas, wallet signing, and sending, fixed sample responses, Web API priority, and restriction to sample inputs, then approved the design-artifact plan. Its relationship to the event period is unconfirmed.

Codex created the [detailed design](BACKEND_DESIGN.md), [OpenAPI definition](openapi.yaml), [static verification script](../scripts/verify_backend_spec.py), [verification dependencies](../scripts/requirements-backend-spec.txt), and [conversation decision record](../docs/prompts/backend-design-decisions.md). `SPEC.md`, `ARCHITECTURE.md`, `PLAN.md`, and this log were also updated. AI helped define API fields, states, comparison rules, errors, and the test plan.

Python 3.11 validated OpenAPI 3.1 syntax and references. Thirty response examples for three APIs, nineteen scenarios, and fixed-value mappings passed. JSON Schema rejected ten invalid requests and responses. The first check found a sample address with 42 hexadecimal digits; it was corrected to 40 and rechecked. The detailed design documents the rerun procedure. Local document references, requirement IDs, and whitespace were checked.

B01–B11 are a test plan to run after API implementation, not completed tests. The API server, Gateway, wallet, and Amoy connection are unimplemented. No existing UI or PoC changes, deployment, commit, or push occurred.

## 2026-09-26 JST: Implement the fixed-mock Web API

Following the [implementation instruction](../docs/prompts/2026-09-25/152556-790938-5fdac443e5ab4602b26eb512cec3edb6.json), three APIs for card retrieval, registration preparation, and registration confirmation were added to [apps/web](../apps/web/README.md). Their relationship to the event period is unconfirmed.

Codex created the Next.js and TypeScript setup, Route Handlers, Registration Service, Mock Gateway, Mock Wallet operation library, generated types, validators, and fixed samples from OpenAPI, tests, and startup instructions. An implementation agent handled `src/backend` and `src/app`; the parent agent handled configuration, generation, tests, and documentation. No existing PoC code or data was reused.

Preparation validates the card, permitted wallet, chain, and sample name. Confirmation compares the transaction, receipt, event, and current registration. Signing, sending, and MultiBaas connectivity are mocked; there is no database or stored registration result. Rejection in Mock Wallet does not start confirmation, and an unknown result does not cause automatic resubmission.

Discriminated types follow the OpenAPI type definitions. Ajv validation code is generated ahead of time to avoid dynamic code generation in Workers. TypeScript 5.9.3 satisfies OpenAPI type-generation compatibility. Dependency versions and the lockfile were saved.

Thirty-six service, boundary, configuration, and wallet tests passed, as did twenty-four HTTP tests each for Next.js and local Workers. OpenAPI static validation, generated-output consistency, type checking, and Next.js and Workers builds passed. Workers adds cache-control directives to 404 responses, so the API definition and tests were adjusted while retaining no-store. Initial failures and environment workarounds are in the [implementation and verification record](BACKEND_IMPLEMENTATION.md).

AI-created or changed files include implementation, configuration, tests, README, and generated files in `apps/web/`, `scripts/verify_backend_spec.py`, `specs/openapi.yaml`, `BACKEND_IMPLEMENTATION.md`, `BACKEND_DESIGN.md`, `SPEC.md`, `ARCHITECTURE.md`, `PLAN.md`, this log, [HTTP results](assets/backend/http-next.txt), and [Workers results](assets/backend/http-worker.txt). Generated files can be reproduced from OpenAPI and the generation scripts.

Existing UI integration, real wallets, MultiBaas, Amoy, and the issuer CLI remain unimplemented and unverified. These results do not count as passing live F01–F10 or A01–A11 tests. No existing UI or PoC changes, deployment, commit, or push occurred.

## 2026-09-26: Save additional Ojiichan Convenience Store designs

After fast-forwarding to the user-specified `origin/main`, Codex created an [index of twelve additional designs](assets/asagohann777/2026-09-26/README.md). Eight new images were saved; four existing images link to previously saved files with identical contents. All twelve were compared with the originals byte for byte. Creation prompts have not been received. Their relationship to the event period is unconfirmed.

The user identified the author and requested a co-authored commit. Codex copied and compared files and recorded the index and hashes. UI changes will follow this image-storage commit.

## 2026-09-26: UI wireframe aligned with the designs

Updated `prototypes/mobile-ui` under the [accepted plan](UI_WIREFRAME_PLAN.md). Its relationship to the event period is unconfirmed. This is separate from image-storage commit `164a180`; the UI changes are not yet committed, pushed, or deployed.

The user asked to align the wireframe with Ojiichan Convenience Store's designs first. The user will produce background and card assets. Codex created or updated `public/app.js`, `public/messages.js`, `styles/input.css`, `scripts/verify.mjs`, the README, plan, and change log. The existing placeholder card SVG remains; no images were generated or edited.

The layout now uses a centered brand and card, short headings, white input panels, a registration-review table, and blue action buttons. Public consent moved to a separate registration-review screen. Editing, simulated approval, progress, completion, and error rechecks remain. The completion screen offers details and home actions. The background is solid sky blue; the README identifies the replacement point. Blockchain-record and tamper-proof wording in the designs is not presented as an achievement of the mock.

The build passed with Node.js 22.22.3. Verification passed in Chromium 149.0.7827.55 and WebKit 26.5 at 320px, 390px, 430px, and PC widths. Checks covered both languages, read results, input and empty fields, review and editing, blocked registration before consent, approval, completion and details, reload, error recovery, and rechecking the same transaction. Mock help identifies photo and light controls as unimplemented. There were zero console errors and zero external submissions. Seven delivered assets matched the build's SHA-256 hashes. A details-dialog check initially read the body before it appeared; the check was corrected to wait for display and rerun.

- [Verification results and delivered hashes](assets/ui-wireframe-2026-09-26/results.json)
- [Read result](assets/ui-wireframe-2026-09-26/chromium-390-unregistered.png), [owner input](assets/ui-wireframe-2026-09-26/chromium-390-registration.png), [registration review](assets/ui-wireframe-2026-09-26/chromium-390-review.png)
- [WebKit completion](assets/ui-wireframe-2026-09-26/webkit-390-success.png), [English review at 320px](assets/ui-wireframe-2026-09-26/chromium-320-english-review.png), [scan at 320px](assets/ui-wireframe-2026-09-26/webkit-320-camera.png)

Screenshots were visually compared with the designs. `git diff --check`, JavaScript syntax, and added-document links passed. Physical devices, cameras, real wallets, and API connections were outside this verification. The backend was unchanged. The public URL still serves the previous version.

A further instruction on 2026-09-26 removed "Scan the QR at the bottom right of the card" from the scan entry in both languages. Codex removed the display element, translation keys, and dedicated CSS.

## 2026-09-26: Publish the UI wireframe

At the user's instruction to commit, push, and deploy, image-storage commit `164a180` and UI commit `43adc92` were pushed to `origin/main`. Both name Ojiichan Convenience Store, GitHub ID `asagohann777`, as co-author.

Ran `npm run deploy` in `prototypes/mobile-ui` using Node.js 22.22.3. Updated the existing `shomei-kun-ui-mock` Worker to version `d5e84b0c-9153-48eb-9c5e-9325947732cd`. The backend was not deployed. The preceding not-committed, not-pushed, and not-deployed statements describe the work before publication.

Public URL: [UI mock](https://shomei-kun-ui-mock.dptr.workers.dev/). `MOCK_BASE_URL=https://shomei-kun-ui-mock.dptr.workers.dev npm run verify` passed in Chromium 149.0.7827.55 and WebKit 26.5. Checks covered both languages, 320px, 390px, 430px, and PC widths, registration, editing, consent, approval, completion, reload, and error actions. All seven assets matched the local build byte for byte and by SHA-256. Application console errors were zero. Seventy-eight WebKit screenshot-tool CSP warnings were recorded separately under the existing rules.

The public page was also opened in Chrome to check language switching and removal of the scan-location instruction. The public version is still an interaction mock and performs no real registration. Background and card assets remain placeholders. The separate wallet-approval screen remains a simulated interaction; no instruction to remove it has been received.

- [Public-version verification](assets/ui-wireframe-2026-09-26/live-results.json)
- [Public scan entry](assets/ui-wireframe-2026-09-26/live-scan-entry.png)
- [Publication-instruction hook record](../docs/prompts/2026-09-25/205941-947650-e23f000083874e1e9462c37e4acf41d8.json)

## 2026-09-26: Match button finishes to the designs

At the user's request, Codex changed `prototypes/mobile-ui/styles/input.css`. Primary actions received a vertical blue gradient, top highlight, thin luminous edge, and soft outer glow. Secondary actions and round tools use white faces, thin borders, and small shadows. Next and Register arrows moved to the right edge. Disabled controls lose the gloss; pressed and keyboard-focus states were added. Small primary buttons use a darker blue for readable text.

The [approach](UI_WIREFRAME_PLAN.md) was recorded first, and existing designs were compared with screenshots. No image assets were added. The relationship to the event period is unconfirmed.

The build passed in Node.js 22.22.3. Existing viewport, language, and registration-flow checks passed locally in Chromium 149.0.7827.55 and WebKit 26.5. Console errors were zero, and seven delivered assets matched the build. `git diff --check` passed.

- [Blue primary action](assets/ui-buttons-2026-09-26/chromium-390-unregistered.png)
- [Disabled Register and white Edit buttons](assets/ui-buttons-2026-09-26/chromium-390-review.png)
- [Secondary and primary completion actions](assets/ui-buttons-2026-09-26/webkit-390-success.png)
- [Verification results](assets/ui-buttons-2026-09-26/results.json)
- [Request hook record](../docs/prompts/2026-09-25/210606-402653-89a5ba5362c141fca9b6cc1913135f0a.json)

This change is not committed, pushed, or deployed. It is separate from the public-version update.

## 2026-09-26: Registration-progress animation

Following the user's image-reference instruction, Codex inspected the [registration-progress design](assets/asagohann777/screens/registering-ja.jpg) and updated `prototypes/mobile-ui/public/app.js`, `public/messages.js`, `styles/input.css`, `scripts/verify.mjs`, the README, plan, and change log. The relationship to the event period is unconfirmed.

CSS creates card movement, a light around its border, glowing cubes above and beside it, light from the base, and rotation of a ring around the link symbol below. QR and wallet symbols sit at the lower left and right. Codex created the cube and link SVG paths. The card shares the existing placeholder SVG; the author's image was not cropped for use.

Normal simulated registration completion timing is unchanged. Added `?scenario=registering` and a menu entry for review. This preview creates no transaction ID and does not finish over time. Reload preserves the preview. `prefers-reduced-motion: reduce` stops all decorative animation. The animation does not represent a progress percentage or real chain connection.

Build, syntax, and `git diff --check` passed. In addition to normal registration, Chromium 149.0.7827.55 and WebKit 26.5 checks covered preview reload, absence of a transaction ID, actual ring-transform changes, stopped animation with reduced motion, and 320px, 390px, and 430px layouts. Console errors were zero. Seven delivered assets matched the local build.

- [390px composition](assets/ui-registration-motion-2026-09-26/chromium-390-registering.png)
- [WebKit at 320px](assets/ui-registration-motion-2026-09-26/webkit-320-registering.png)
- [WebKit capture during animation](assets/ui-registration-motion-2026-09-26/webkit-430-registering-motion.png)
- [Verification results](assets/ui-registration-motion-2026-09-26/results.json)
- [Request hook record](../docs/prompts/2026-09-25/211554-577823-cc255df459494b45b07b1ac2872d3968.json)

Screenshots are still images; motion was verified through the script and local preview. This change and the preceding button finishes are not committed, pushed, or deployed.

## 2026-09-26: Scan-screen finishes and animation

Following the user instruction and [scan design](assets/asagohann777/screens/qr-scan-ja.jpg), Codex updated `public/app.js`, `styles/input.css`, `scripts/verify.mjs`, the README, plan, and change log. The relationship to the event period is unconfirmed.

The reading indicator became a translucent white capsule with a rotating ring. Photo and Help became glossy round buttons with pale-blue shading; the photo icon became a landscape and the light icon a lightning bolt. The four scan corners became thick glowing blue brackets. A light-blue scan line travels one way in 3.6 seconds before reversing. Reduced motion holds the line in the center and stops the frame and ring. Codex created the SVG paths and CSS. No new image assets were used.

The build and `git diff --check` passed. Chromium 149.0.7827.55 and WebKit 26.5 verified scan-line transform changes, reduced-motion stopping, Photo, Help, and Light explanations, viewport sizes, and the existing registration flow. Application console errors were zero; seven delivered assets matched the build. This does not implement a real camera, photo reader, or light.

- [Scan screen at 390px](assets/ui-scan-motion-2026-09-26/chromium-390-camera.png)
- [Capture during motion](assets/ui-scan-motion-2026-09-26/chromium-390-camera-motion.png)
- [WebKit at 320px](assets/ui-scan-motion-2026-09-26/webkit-320-camera.png)
- [Verification results](assets/ui-scan-motion-2026-09-26/results.json)
- [Request hook record](../docs/prompts/2026-09-25/212643-209774-d3ea7e1413a541c2a96a9254626b1dc0.json)

These are local changes, not committed, pushed, or deployed. Screenshot review checked frame and control placement and text fit.

A further instruction on 2026-09-26 reduced the guide inside the camera preview. The preview's dimensions remained unchanged; the centered guide became 72% and the sample QR 58%. Scan-line width and travel and corner thickness were adjusted. The build and diff-whitespace checks passed, and Chrome visual review confirmed space around the preview. Local only; not deployed.

## 2026-09-26: QR read-result finishes

At the user's further instruction, Codex changed `styles/input.css`. Only the read-result check received a spherical blue gradient, white border, soft glow, and thicker check strokes. The Shomei Ichiro information panel became a translucent white and pale-blue surface with an inset highlight and white border. The Unregistered label retained its white background and blue text with light shading. The green registration-complete check was unchanged.

The approach is in [UI_WIREFRAME_PLAN.md](UI_WIREFRAME_PLAN.md). The build and `git diff --check` passed. Chrome visual review checked the read-result check, information panel, Unregistered label, and text. No image assets changed. Local only, not committed, pushed, or deployed. The relationship to the event period is unconfirmed.

## 2026-09-26: Shared information-panel finishes

At the user's request to apply the treatment across screens, Codex moved the translucent surface, white border, and inset highlight from `.card-summary` to shared `.info-panel` styles in `styles/input.css`. The treatment now covers owner input, registration review, wallet approval, registered state, and completion as well as read results. Layout, input, and controls remain unchanged. The relationship to the event period is unconfirmed.

Build and diff-whitespace checks passed. Chromium 149.0.7827.55 and WebKit 26.5 verified viewport sizes, both languages, registration flow, and scan and registration animations. Console errors were zero, and seven delivered assets matched the build. Input, review, approval, and completion screenshots were visually checked.

- [Input](assets/ui-panels-2026-09-26/chromium-390-registration.png), [review](assets/ui-panels-2026-09-26/chromium-390-review.png), [approval](assets/ui-panels-2026-09-26/chromium-390-approval.png), [completion](assets/ui-panels-2026-09-26/chromium-390-success.png)
- [Verification results](assets/ui-panels-2026-09-26/results.json)
- [Request hook record](../docs/prompts/2026-09-25/213752-492296-d834d047326940678ba9d42ae84993b4.json)

Local only, not committed, pushed, or deployed.

A further instruction on 2026-09-26 requests a combined commit and push of the button, registration-progress, scan, and information-panel adjustments and their development records. Earlier not-committed statements preserve the state at each step. The final build was rechecked against the hashes from both-browser verification of the shared panels and matched. This instruction does not include deployment.

## 2026-09-26 JST: Manage the Curvegrid integration plan in a PR

The user selected a real Curvegrid Testnet connection, a new owner-registration contract, free-form names, and MetaMask connections from ordinary browsers. The user then split responsibilities for parallel UI work and specified plan storage, detailed design, user review, then implementation. The relationship to the event period is unconfirmed.

Codex created a dedicated worktree and `feat/curvegrid-integration-backend` branch, the [plan](CURVEGRID_INTEGRATION_PLAN.md), and [conversation decision record](../docs/prompts/curvegrid-integration-decisions.md). Three related hook JSON files were copied unchanged from the original workspace. This stage saved plans only; code, dependencies, and deployment configuration were not changed.

Plan commit `23bf058` opened [Draft PR #1](https://github.com/asagohann777/shomei-kun-qr-proof/pull/1). Codex then created the [detailed design](CURVEGRID_INTEGRATION_DESIGN.md) and the proposal, requirements, design, and tasks for the [OpenSpec change](../openspec/changes/curvegrid-testnet-integration/proposal.md). A read-only supporting agent researched MultiBaas official documentation; the parent agent applied the findings to the API, ABI, CLI resume behavior, UI responsibilities, and test plan. AI use covers those documents and this log.

`openspec validate curvegrid-testnet-integration --strict` passed. Checks covered new-plan local links and whitespace and byte-for-byte equality of three prompt copies with their originals. All implementation tasks remain incomplete. No contract, API, or CLI code changes, live connections, app tests, or deployment occurred. Implementation will start after the user reviews the detailed design.

## 2026-09-26 JST: Curvegrid implementation approval and rebase

The user [approved implementation in the same PR](../docs/prompts/2026-09-25/210335-646629-78b744b43cdc4d82a0eb1b3135d6a539.json). The approved detailed design was commit `453387e0fac95e097ad85e5ea75e97ffc4395d6f`. Following the [instruction to rebase onto the latest UI](../docs/prompts/2026-09-25/210422-768494-7d8a0873b7584160a109075cfd53f25a.json), `git pull --rebase origin main` incorporated `cdb1ffe`. A change-log conflict was resolved by retaining both additions. The design commit changed to `b537e04`, with identical design text. PR #1 was updated using force-with-lease pinned to the previous HEAD.

Implementation uses the dedicated worktree without changing the original UI workspace. Live configuration, deployment, and UI integration tests have not yet occurred. The relationship to the event period is unconfirmed.

Codex created or updated Solidity, CLI, tests, and ABI in `contracts/`; live Gateway, HTTP, connection API, generated types and validators, tests, and dedicated Worker configuration in `apps/web/`; `specs/openapi.yaml`; the OpenAPI verification script; OpenSpec tasks and design status; SPEC and ARCHITECTURE implementation status; the [runbook](CURVEGRID_INTEGRATION_RUNBOOK.md); and the [implementation and verification record](CURVEGRID_INTEGRATION_IMPLEMENTATION.md). All nineteen existing mock scenarios remain. See the implementation record for test results and remaining dependency-audit findings. Live keys are not configured, and live connectivity, publication, and smartphone integration tests have not run.

## 2026-09-26 JST: Check prerequisites for live connectivity

At the user's request for connectivity testing, issue organization, and rebasing, Codex fetched the latest main, started the local live API, and checked HTTP responses. Missing MultiBaas configuration produced 503 CONFIGURATION_MISSING. With external-network permission, Codex also confirmed that the dedicated Cloudflare Worker did not exist. Results and proposed responses are in the [connectivity report](CURVEGRID_CONNECTIVITY_REPORT.md). This is not considered a live authentication failure.

Codex checked configuration item names only, verified HTTP behavior, and organized issues and documentation. The user is being asked where connection settings are stored. No chain writes or Worker publication occurred. The relationship to the event period is unconfirmed.

After the user provided settings, Codex read live MultiBaas chain state, blocks, and the Library list. Administrative REST connectivity succeeded and confirmed chain ID `2017072401`. New Library `shomeikuncardregistry` / `1.0.0` was registered, but nothing was deployed on-chain. A live API 400 response exposed a CLI bug that removed the bin's 0x prefix; it was fixed with a regression test. Sanitized live JSON and updated issues are in the connectivity report. Public RPC and test-wallet selection remain under confirmation.

- 2026-09-26: Deployed a Registry to Curvegrid Testnet, issued a dedicated card, and registered it with the owner's test key. Measured API confirmed status, public ownership, and evidence. Fixed the bytecode prefix, event retrieval count, development bundler, and OpenNext environment-value embedding. Verified 66 API tests, 16 CLI and contract tests, and live-response fixtures. Secret storage completed after the user explicitly approved an automatic-review rejection. Fixed Workers' redirect setting; the public Worker passed connection, owner, registration-transaction, reload, and duplicate-registration rejection checks. Smartphone UI integration remains untested. AI handled implementation, operations, tests, and records; humans handled connection settings, faucet funding, and the test-key creation policy. The relationship to the event period is unconfirmed. See `CURVEGRID_CONNECTIVITY_REPORT.md`.

## 2026-09-26 JST: Connect the latest UI to the live API and wallet

At the user's instruction, API and MetaMask connections were added to the UI from latest main `3598094`. The default UI build remains mocked; the dedicated integration build includes live connections. Work continued in PR #1 without changing the UI-review Worker. The accepted design is in the [plan](UI_LIVE_CONNECTION_PLAN.md); the public URL, measurements, and remaining physical-device criteria are in the [report](UI_LIVE_CONNECTION_REPORT.md).

Codex created the live controller, MetaMask boundary, shared-template integration, build switching, and tests in `prototypes/mobile-ui`, plus bundled UI, entry redirects, and documentation in `apps/web`. Supporting agents handled the independent controller and wallet boundary; the parent integrated and measured them. The user decided the connection policy, preservation of mock mode, and creation of a dedicated test wallet with public information saved. Three prompts saved by the hook in the original workspace were copied unchanged to `docs/prompts/2026-09-26`. The relationship to the event period is unconfirmed.

Forty-three UI-boundary tests, sixty-six API tests, type checking, and Chromium and WebKit mock and live screen tests passed. The public UI submitted exactly one live transaction using a local test key, then verified API confirmed status, reload, and owner display in another browser. Physical-smartphone MetaMask transition and return, and a separate physical-device acceptance check remain incomplete.

A public SDK launch test found a CommonJS dynamic-import incompatibility. An ESM reference and a small conversion boundary fixed it. At the corrected public URL, Chromium and WebKit without an injected wallet confirmed the MetaMask launch link and relay connection start. Testing stopped before switching to a physical smartphone and does not replace a signing test.

## 2026-09-26 JST: Open-registration demo and diagnostic logs

The user clarified that demo ownership registration must be open to everyone. Codex implemented the contract's zero allowed-wallet address as unrestricted, updated the CLI default and API preparation, state reads, events, and transaction checks. Existing records were unchanged. Version 1.1.0 was deployed separately and the dedicated Worker's registry changed. See the [open-registration record](OPEN_REGISTRATION_DEMO.md) for details and the new demo URL. A live transaction exposed a missing post-registration comparison; a shared permission check and regression test fixed it.

The earlier logging request was also implemented with request IDs, structured error logs, diagnostic copying in the UI, and insufficient-gas guidance. Codex handled code, specifications, tests, deployment, and documents; humans operated the public demo, reported errors, and corrected the scope to unrestricted registration. The relationship to the event period is unconfirmed. Browser registration with a test key different from the previous allowed wallet succeeded. Seventy API tests, forty-three UI tests, and seventeen contract and CLI tests passed.

## 2026-09-26 JST: Insufficient-gas error classification

The user's diagnostic log reproduced a MultiBaas 400 during registration preparation with a zero-balance wallet. Codex replaced the blanket HTTP 503 conversion, classifying only the observed insufficient-funds response as 422 INSUFFICIENT_FUNDS. OpenAPI, generated files, regression tests, and browser tests were updated. The public Worker was checked with the same user address without funding or owner registration. See the [open-registration record](OPEN_REGISTRATION_DEMO.md). The relationship to the event period is unconfirmed.

## 2026-09-26: Registration waiting and refresh display

Fixed the user's physical-device report that refreshing after registration still displayed registration in progress. Initial registration checks the transaction, owner, and evidence for up to sixty seconds after submission. Later refreshes retain the card and owner and change only the status to checking. Network errors do not erase the known owner, and the user can refresh again.

The human identified the misleading display and requested local status updates and a maximum one-minute wait. AI implemented state management, Japanese and English display, CSS, tests, and plan and result records. See [registration and refresh display](REGISTRATION_STATUS_UI.md) for affected files and verification. The relationship of this work's timestamp to the event period is unconfirmed.

### Further fix for loading registered cards

The user reported a remaining path that displayed registration in progress when loading a card. AI separated registered-card loading from registration-history restoration so returning to the screen does not resume registration. Fifty UI tests passed. Details were added to `REGISTRATION_STATUS_UI.md`.

## 2026-09-26: Save and organize backgrounds, logos, and other assets

Saved fourteen assets supplied by the user from Ojiichan Convenience Store: eleven backgrounds and one logo, QR illustration, and card each. Thirty-one assets, including seventeen existing screen designs, were classified and renamed by content. The [asset index](assets/asagohann777/README.md) records old names, new names, and SHA-256 mappings. Codex copied, visually classified, renamed, updated existing-document links, and verified files. No images were generated or edited. All thirty-one hashes and destination links were checked. Creation prompts have not been received. Creation dates, their relationship to the event period, AI use in asset creation, and licenses are unconfirmed.

## 2026-09-26: Integrate supplied backgrounds, logo, and card into the UI

After pushing asset-organization co-authored commit `7212059` to origin/main, Codex followed the user's instruction to integrate two backgrounds, a logo, a QR illustration, and a card into the local UI. These are images supplied by Ojiichan Convenience Store. Codex updated distribution copies, CSS display frames and white overlays, image references, verification targets, the plan, and README. Original images were not edited. The relationship to the event period is unconfirmed.

The build passed. Existing interaction, language, and viewport checks passed in Chromium 149 and WebKit 26.5 with zero console errors. After final adjustment of the initial screen's white QR frame and demo label position, both browsers were additionally checked at 320px and 390px for image loading, horizontal overflow, and screenshots. Background integration remains local and is not yet committed, pushed, or deployed.

## 2026-09-26: Publish the background and logo integration

At the user's instruction, co-authored commit `112797e` was pushed to origin/main and deployed to dedicated UI-mock Worker `shomei-kun-ui-mock`. Public URL: https://shomei-kun-ui-mock.dptr.workers.dev . Version ID: `cdaa816a-7069-4fe6-8d9d-5ebffa5efc1a`. The version includes backgrounds, logo, card, and the preceding button, scan, and registration-progress animation adjustments.

Public URL checks passed for Japanese and English, registration flow, and viewport sizes in Chromium 149 and WebKit 26.5. Twelve delivered files matched local dist byte for byte, including five new images. Application console errors were zero. The existing verifier separately recorded eighty-eight WebKit CSP warnings limited to Playwright screenshots. This was not verification of real wallets or transactions. Codex handled commit, push, deployment, public verification, and record updates. The relationship to the event period is unconfirmed.

## 2026-09-26: Combine the latest UI and live integration

Following the user's PR-merge instruction, supplied images and backgrounds from main `e675119` were integrated into the live branch. The default mock/mock mode and environment-based switching remain. Codex resolved conflicts, ran Chromium and WebKit tests in both modes and fifty UI tests, reviewed screens, deployed the dedicated Worker, and checked live API reads. Registered cards do not resume registration even when saved history exists. Verification and public versions are recorded in `REGISTRATION_STATUS_UI.md`.

## 2026-09-26: Fix background truncation while scrolling and QR alignment

Following the user's report, reproduced a background ending at 850px on a 986px screen. Moved the background to a fixed layer within the screen width and placed the card and QR in the same crop-coordinate system. Codex updated CSS, card DOM, and the plan. Original images were unchanged. The build and full Chromium and WebKit interaction checks passed with zero console errors. The scroll bottom of a 390×650 screen and the card alone were captured and checked in both browsers. The relationship to the event period is unconfirmed.

Before publication, separate live-integration work landed on origin/main, so the changes were rebased while preserving dynamic QR switching. After integration, fifty UI tests, full mock interaction checks in Chromium and WebKit, and QR square geometry and scrolled-background coverage at 320px, 390px, and 1365px were rechecked. Fix commit `2686495` was pushed and the UI mock updated to version `5998a3a2-ec1d-4357-9e39-2736e7dc89b7`. Public JS and CSS matched the build byte for byte; the bottom of the public 390×650 screen was checked. The live-integration Worker was not part of this deployment.

## 2026-09-26: Receive revised approval and registration-review designs

At the user's instruction, two revised designs by Ojiichan Convenience Store were saved before UI changes. `S__32858119.jpg` became [wallet approval](assets/asagohann777/screens/wallet-approval-ja-01.jpg); `S__32858117.jpg` became [registration review](assets/asagohann777/screens/registration-confirm-ja-02.jpg). Codex copied, named, indexed, and recorded hashes. The copies matched their originals byte for byte. Earlier designs were retained; images were not edited. Creation prompts and the relationship to the event period are unconfirmed.

## 2026-09-26: Apply revised approval and registration-review designs

The UI changed after design-storage commit `ca1bb1c` was pushed. Registration review uses a smaller card and adds icons for name, wallet, and card ID. Consent text is split into bold "I have reviewed the public information" and a note that records cannot be changed or deleted. Approval uses a translucent information panel and blue-outlined decline button. English uses the same structure. Live mode retains approval inside MetaMask without simulated buttons. Codex updated `public/app.js`, `public/messages.js`, `styles/input.css`, the plan, and documentation. The relationship to the event period is unconfirmed.

The build and existing mock interaction checks passed in Chromium 149 and WebKit 26.5. After final adjustments to panel whiteness and column widths, review and approval screens were captured in both browsers and languages at 320px and 390px. Checks confirmed no horizontal overflow, keyboard consent toggling that enables and disables registration, and no transaction after rejection. Images are saved in `prototypes/mobile-ui/artifacts/revised-*`. No new real-wallet signature or transaction occurred. This UI change remains local, uncommitted, and undeployed.

## 2026-09-26: Publish revised review and approval screens

After user approval, co-authored commit `8101edd` was pushed to origin/main and the UI-mock Worker updated to version `b85a11b3-7f5b-43c3-9c43-c62f986dc6b4`. Public app.js, messages.js, and style.css matched the local build byte for byte. Chromium and WebKit checks covered field icons, consent text, blocked registration before consent, the approval screen, and absence of a transaction after rejection. Public screenshots are in `prototypes/mobile-ui/artifacts/public-revised-*`. Codex handled publication, verification, and records. The live-integration Worker was not updated.

## 2026-09-26: Remove the home button and fix logo clipping

At the user's instruction, Codex removed the home button from result screens in `public/app.js` and made result actions a single column in `styles/input.css`. The logo's lower edge exceeded a fixed-pixel frame and was clipped, so the frame was replaced with a shared crop region and aspect ratio based on the image's actual dimensions. The source image was unchanged. The build passed. Chromium and WebKit at 320px, 390px, and 1365px verified the full logo display area, no horizontal overflow, no home button, the details dialog, and navigation through the logo; screenshots were saved. This fix remains local and undeployed. The relationship to the event period is unconfirmed.

## 2026-09-26: Publish the home-button and logo fixes

At the user's instruction, commit `f4ccac9` was pushed to origin/main and the UI mock updated to version `81afa823-0c34-4bbc-826f-8a0a9c759f75`. Public JS and CSS matched the build byte for byte. Chromium and WebKit verified home-button removal, details display, and logo navigation. Public logo screenshots are in `prototypes/mobile-ui/artifacts/public-logo-fixed-*`. Codex handled publication and verification. The live-integration Worker was not updated.

## 2026-09-26: Switchable real camera scanning

- At the human's instruction, used dedicated worktree `shomei-kun-qr-proof-camera-scan` and branch `feat/camera-scan`. The original workspace was unchanged.
- AI implemented `UI_CAMERA_MODE`, camera lifecycle, local photo decoding, light control, QR acceptance rules, and related tests. Design assets and attribution were unchanged.
- Used `qr-scanner` 1.4.2 and its bundled worker. Configuration, stop conditions, accepted QR codes, and unverified physical-device scope are in the [camera specification](CAMERA_SCAN.md).
- The [implementation request](../docs/prompts/2026-09-26/032930-685335-75407fed05314b13aceddf690f21b8df.json) and [plan execution instruction](../docs/prompts/2026-09-26/033424-981583-b71e1b9dc3de4761b5d83c3dffea3cd6.json), saved by the original checkout's hook, were copied to the same relative paths. Copying is not treated as new automatic collection.
- The relationship to the event period is unconfirmed. Registration using a real camera, main integration, and deployment are outside this change's verification.

Fifty-eight unit tests passed. The default UI's `npm run verify` and `verify-live-ui.mjs` using fixed live-API and MetaMask fixtures passed in Chromium and WebKit, with zero consoleErrors. The latter's optional read-only dedicated-URL check was not run. Camera settings passed through to the integration build, and CSP and Permissions-Policy were checked.

Camera-specific verification also passed. Chromium and WebKit checked photo and worker decoding, displayed IDs and generated QR codes, photo use after denial, and both languages at 320px and 390px. Generated video in Chromium verified automatic reading and track stopping, retained video during language switching, hidden/resume/close behavior, and passing the read ID through delayed live-API initialization. These are not physical-device checks.

## 2026-09-26: Clarify camera-start errors

Following the user's feedback, a long bold sentence was split into a short heading and browser-settings guidance. The existing blue-and-white finish remains; guidance uses normal weight and left alignment. Codex changed Japanese and English copy, rendering, and CSS. Camera behavior is unchanged. The relationship to the event period is unconfirmed.

Display and controls were checked in Chromium and WebKit, both languages, at 320px and 390px. All camera-specific checks passed. The revision-request hook record was copied from the original checkout to the same relative path. Local review URL: http://localhost:4187 .

## 2026-09-26: Place the camera-resume control

At the user's request to resume from the stopped display, the resume button moved from the bottom to the center of the stopped camera frame, explicitly labeled "Resume camera." Codex changed rendering and both languages. The existing stream-reacquisition process remains. The relationship to the event period is unconfirmed.

Camera-specific browser checks passed. Generated video confirmed that the in-frame button resumes video after stopping and that closing ends tracks. The request's hook record was copied from the original checkout and saved.

## 2026-09-26: Home-page QR scaling

The user requested subtle scaling. Codex updated `prototypes/mobile-ui/styles/input.css` and the accepted plan. The QR and white frame scale between 1 and 1.035 over a four-second cycle and stop under reduced motion. The build passed. Generated CSS and a home-equivalent DOM were loaded directly into Chromium and WebKit to check scale at the start, midpoint, and end, no horizontal overflow at 320px, and stopping under reduced motion. Full-page interaction checks and deployment were not performed. The relationship to the event period is unconfirmed.

## 2026-09-26: Publish the home-page QR animation

At the user's deployment instruction, Codex updated UI-mock Worker `shomei-kun-ui-mock` to version `868c8bae-286a-4cb3-a22d-a8abed90edf0`. Public URL: https://shomei-kun-ui-mock.dptr.workers.dev . Public CSS matched the local build byte for byte. Chromium and WebKit checked scale changes and reduced-motion stopping on the public home page. The live-integration Worker was not updated. No commit or push occurred in this step. The relationship to the event period is unconfirmed.

## 2026-09-26: Shorten the test-environment label

At the user's instruction, the live-connection environment label was shortened to "Test environment" in both languages. Default mock and read-only labels remain. Codex updated both language strings and display conditions. The relationship to the event period is unconfirmed.

## 2026-09-26: MetaMask connection preparation and return

The user reported that connection stalled after moving from an external iPhone browser to MetaMask and that missing-network guidance was unclear. The user chose a single flow for connection and network preparation. Codex used frontend-design to design the wallet area within the existing UI, then implemented separate preparation and registration states, initial SDK connection, network addition and switching, foreground-time wait guidance, return-state checks, Japanese and English help and mock scenarios, diagnostic logs, and tests. The latest main's review, approval, and logo fixes remain. The relationship to the event period is unconfirmed.

The user also requested removal of test-card records from public Git history, so the unmerged PR branch was revised. Cards were not reissued. `METAMASK_PREPARATION_PLAN.md` records planning and verification, including the limitation that GitHub references to older commits remain.

Final public version: `caadbc80-87ac-414f-9024-ed63342b7344`. Seventy-four UI unit tests, existing mock and live browser tests, return tests with CSP, actual SDK launch, and Worker tests passed. Verified twenty-four public assets, 404 for the public index, and API ready. A physical-iPhone round trip remains unverified.

## 2026-09-26: Enable the real camera in integration

At the user's test request, Codex confirmed the latest main was incorporated, rebuilt and published the dedicated integration with `UI_CAMERA_MODE=live`. The camera implementation was unchanged and default mock preserved. Added public video and photo QR verification scripts and startup instructions. Worker version: `7a4a7673-a63b-465e-8cc8-a648561931fe`. Twenty-four public assets matched. Chromium video-QR reading and WebKit photo reading after denial passed. Physical devices remain unverified. The relationship to the event period is unconfirmed. See `INTEGRATION_CAMERA_PLAN.md`.

## 2026-09-26: Guide iPhone and iPad users to MetaMask's browser

The user reported Safari connection timeouts and requested in-app browser navigation and iPad support. Codex implemented device detection, an official dapp link to the same card, navigation before input, and in-app guidance. Existing UI, mock, and real-camera behavior remain. Seventy-six unit tests and Chromium and WebKit branching and display tests passed. Dedicated integration version `77d732e4-0ad2-424c-88ad-bd6466962351` was deployed, and twenty-four public assets matched. App launch and approval on physical devices remain unverified. See `APPLE_METAMASK_BROWSER_PLAN.md`. The relationship to the event period is unconfirmed.

### Respond to the physical-device report that MetaMask's browser does not open

After the user reported that launching the app did not open its browser, Codex checked official link parsing. The link changed to `metamask://dapp/`, with copying the same card URL and manual-paste guidance added. Seventy-six unit tests and link and copy tests in both browsers passed. Dedicated integration version `f356b57a-c981-4ce6-975d-9d5e0d4f7a21` was published, and twenty-four assets matched. The cause of the in-app stall is unknown; physical-device success is not claimed.

## 2026-09-26: Receive image-generation Prompt Report 1

The user supplied [both parts of Report 1, sections 1–28](../docs/prompts/asagohann777-prompt-report-1-2026-09-26.md), covering Ojiichan Convenience Store's image generation, UI design, and asset separation. It records human decisions about the QR-first flow, wording, visual priority, setting, aspect ratios, and the area for later QR placement, followed by corrective AI instructions. Codex extracted and combined the supplied text and saved sources, distinctions from supplied assets, and related links. Text-input agreement, links, and diff were checked. No image generation or UI implementation occurred in this step. Creation dates relative to the event period and mappings between individual assets and prompts remain unconfirmed.

## 2026-09-26: Save English submission screenshots and brand images

At the user's instruction, nine English screenshots were captured from the integrated main `5d3e676` UI demo, and two specified images were saved at original resolution as the icon and cover. Codex captured, visually reviewed, compared originals, and recorded storage. Only screenshot links were added to README. These are not evidence of real transactions. See the [storage record](SUBMISSION_ASSETS_2026-09-26.md). The relationship to the event period is unconfirmed. At the user's commit and push instruction, assets, capture scripts, storage records, and related prompts are included in this change.

## 2026-09-26: Synchronize current specifications and edit prose

The user requested OpenSpec synchronization, concise writing, and removal of obsolete undecided items. Codex organized the specification, architecture, demo procedure, and camera specification, added implemented screen behavior to `curvegrid-testnet-integration`, and synchronized it with current specifications. Design-approval workflow steps were removed from requirements, and a documentation entry point was added. Current OpenSpec and change validation, relative links, and synchronized-content equality were checked. Implementation code was unchanged. The relationship to the event period is unconfirmed.

## 2026-09-26: Japanese submission README draft

At the user's instruction, Codex pulled the latest main and organized the logo, cover, screenshot links, overview, pre-existing work, and new features in Japanese. Recorded the Continuity-track submission policy. Codex wrote with unslop and compared official websites, event rules, and existing documents. Implementation code and specification text under revision in another session were unchanged. Accepted content is in the [README writing record](README_JA_PLAN.md). The relationship to the event period is unconfirmed.

## 2026-09-26: MIT license and README adjustments

At the user's instruction, MIT was adopted for source code, with LICENSE, SPDX identifiers, generated-code headers, and package metadata aligned. Rights to supplied assets remain separate. Specified README sentences and source links were removed, and the asset provider's GitHub link was added. Codex handled updates and verification. See the [license policy](LICENSE_POLICY.md). The relationship to the event period is unconfirmed.

## 2026-09-26: Optional ENS recipient and wallet registration search


The human revised the ENS design to remove card subnames and new Registry/Resolver deployments, retain optional ENS and the existing QR flow, and search existing registration events by the resolved wallet. Codex implemented the resolver and CLI checks in `contracts/cli`, the typed search endpoint and event verification in `apps/web`, the optional Japanese/English search in `prototypes/mobile-ui`, corresponding tests, and `specs/ENS_INTEGRATION.md`. OpenAPI generated types and validators were regenerated. This entry records work on this date; it does not independently establish event eligibility.

Verification: contract/CLI tests 21 passed, API tests 76 passed, UI tests 78 passed. Contract and API TypeScript checks passed. OpenAPI generation consistency, strict OpenSpec validation, Next.js build, UI builds and the Cloudflare Worker integration build passed. The Worker build confirmed runtime-only environment bindings and its embedded-credential check passed. Chromium and WebKit verified ENS search, partial versus empty results, pagination, existing detail navigation, Japanese labels, 320px layout, input escaping and the QR entry. Browser tests use synthetic API responses.

A read-only Sepolia lookup resolved `shomeikun.eth` to `0xc22D961e56b70a73f6dCB1EC0a47b7Da1Fe38FDd`. The human acquired the name and confirmed access to the same wallet in PC Chrome and mobile MetaMask. Live card issuance and registration, deployment of the ENS changes, and physical-device verification are deferred. No ENS changes were deployed by this implementation pass. Test procedures and these limits are recorded in `specs/ENS_INTEGRATION.md`.

The existing full UI browser regression also passed on Chromium 149 and WebKit 26.5 with no console errors.

### ENS UI review in mock mode

After the user could not see the ENS changes in the local mock, Codex added the same search entry to mock mode and a fixture adapter in `prototypes/mobile-ui/src/ens-mock.js`. `/?preview=ens` opens it directly. The screen identifies the results as samples, supports a paged list, empty/error states, and opens existing mock card details. Live mode retains the real API adapter. This enables UI review without credentials or transactions.

### ENS screen design revision

The human requested a pale ENS button matching the QR action and a clearer card-search screen. Codex used the frontend-design skill to keep the existing blue/white identity, shorten the screen title, place search in a white input panel, separate the resolved wallet from results, and show the existing card artwork, ID, registered nickname and record action in each row. Technical and fixture instructions moved into expandable help. The mock at port 4173 reflects the revision. Chromium and WebKit passed search, pagination and detail navigation at 320px; the UI suite passed 78 tests. Design decisions are in `specs/ENS_UI_DESIGN.md`.

### Primary name display and live read verification

The human added Sepolia Primary name display to the registration screen, with mandatory forward-address confirmation, address-only fallback and stale-result protection on account changes. Codex added the optional typed `/api/v1/ens/primary-name` endpoint, a resolver method, UI lookup controller and mock name-present/unset toggle. Registration identity and authorization still use the wallet address. A read-only real RPC call verified `0xc22D961e56b70a73f6dCB1EC0a47b7Da1Fe38FDd` reverses to `shomeikun.eth` and forwards to the same address.

A separate real read through the implemented search service returned two confirmed registrations, `test-20260926-002` at block 18834 and `mobile-ui-20260926-manual` at block 18782, and completed the scan. This verifies real ENS plus Curvegrid lookup from the local runtime; it does not establish deployed Worker behavior. Deployment remains pending the target-specific approval requested after automatic approval review rejected the external mutation.

### Direct address search and copy cleanup

The human requested direct wallet address search and matching home copy, and removed the mock primary-name toggle from the product screen. The input now accepts ENS or an address; direct addresses bypass ENS and return null `ensChainId`. A real read with ENS configuration removed returned the same two registered cards for the user's address. Chromium verified the revised home title/actions, address search, absent toggle and dedicated unset preview URL. API tests passed 78 cases. Primary-name logic had passed 22 contract/CLI tests and 80 UI tests, including stale response rejection; browser checks passed in Chromium and WebKit. Deployment remains unverified pending the previously requested approval.


### Approved real deployment and Worker fix

The user explicitly requested urgent deployment. The validation Worker was deployed with server-side runtime settings, excluding issuer/admin credentials. Direct address search succeeded; ENS initially failed because Workers does not support the fetch redirect error mode. Codex reproduced the error in Worker logs, changed RPC/CCIP requests to manual redirect mode with explicit 3xx rejection, removed temporary diagnostic output, and redeployed. Deployed Primary name and ENS card search then returned HTTP 200, `shomeikun.eth`, and two verified registrations. The added redirect test passed with the other ENS tests. The normal integration Worker is being updated with the verified implementation.


The normal integration Worker deployment completed. Public URL: https://shomei-kun-integration.dptr.workers.dev/ui/ . Published code version before the runtime-secret update: `d4fa748b-1aaf-4c14-9d36-a48de310b63e`. After runtime settings were applied, the public Primary name endpoint returned `shomeikun.eth`. Chromium verified real ENS search and WebKit verified direct-address search, with two results and successful navigation to registered card details; no page errors occurred. Screenshots are local tmp artifacts. Actual MetaMask transaction signing remains a separate user-operated check.

### Submission refresh after user testing

The user reported successful operation after deployment and requested updated specifications, screenshots and submission text. SPEC, ARCHITECTURE, DEMO, ENS_INTEGRATION and the README now cover optional recipient issuance, ENS/address search and verified Primary name display. The nine English mock-flow screenshots were recaptured and three English live ENS/record screenshots added. Capture metadata distinguishes fixtures from actual API records. The live capture now includes `test-20260926-006` alongside the previously observed registrations.

Plain-text English submission fields are stored outside Git at `/private/tmp/shomei-submission-ens-20260926`: short description, description, how it is made, AI use and technology names. They preserve Curvegrid Testnet gas requirements, separate Sepolia ENS from the registration chain, and describe MultiBaas and ENS integration without claiming unverified prize eligibility.

The user confirmed the manual verification environment as PC Chrome with MetaMask. This report is not treated as evidence of an iPhone test.

### Live ENS-restricted issuance

Following explicit user approval, the actual issuer CLI ran with `--recipient-ens shomeikun.eth` and issued `ens-shomeikun-20260926-01`. Recipient confirmation and keystore unlock completed; transaction `0xa7cf862b4f592c745f75340dd43ab198bbe57334ab8c8b9f3ef23fd438b4c96f` succeeded at block 19313. RPC confirmed the fixed allowed wallet `0xc22D961e56b70a73f6dCB1EC0a47b7Da1Fe38FDd`, and the public API returned the unregistered card. `eth_call` accepted registration simulation from this address and rejected a different wallet. The card itself remains unregistered; no user-wallet transaction was signed. The initial attempt used the host Node18 and exited before confirmation or signing; the successful run used Node22.23.1. State and keys remain private on ThinkPad, with no secret values recorded here.

### Unresolved iPhone recovery report

The user reported an app crash during the iPhone test and "Unable to confirm the result" after reopening. A subsequent public API read returned the test card as unregistered with no evidence. A pending transaction has not been ruled out. Codex requested the last completed action and MetaMask activity status; no retry or local attempt deletion was performed. The user requested a checkpoint commit before further investigation. iPhone verification remains incomplete.

### Demo issuance without a wallet restriction

The user clarified that ENS is optional and does not require restricting who can register a card. ENS name/address search and verified Primary name display remain desired. Recipient restriction is no longer a requested ENS feature. The earlier restricted test card remains unchanged; removing obsolete CLI options and updating the remaining implementation documentation are follow-up work.

To unblock video recording, Codex issued `demo-open-20260926-02` without a recipient option. The issuer verified the successful transaction `0xfdabf3a162863b3ce55348e1cf488d9b58ed58f29ca2ff96ca9a222b88760d95` and `allowedWallet` equal to the zero address. The public API returned the new card as unregistered. Its separate card ID avoids the previous card's saved unknown attempt. No user registration was submitted, and the iPhone crash recovery issue remains unresolved.

Demo URL: https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=demo-open-20260926-02

### Demo registration and specification correction

The user reported successful registration of `demo-open-20260926-02`. A public API read subsequently confirmed owner `0xc22d961e56b70a73f6dcb1ec0a47b7da1fe38fdd`, nickname `Tkg`, and available evidence at block 19315, transaction `0xaa931283722cd2fc2dc3959ca1268275f58b5cfda3ca281593221a2624a0d5b8`. This verifies the new registration, not recovery of the old unknown attempt. The user reported no transaction in MetaMask activity for the earlier attempt; the crash cause remains unconfirmed.

At the user's request, SPEC, ARCHITECTURE, ENS_INTEGRATION, DEMO, the UI design note and the active OpenSpec artifacts were aligned with optional ENS search/display and unrestricted issuance. The old CLI restriction options remain pending removal. The existing five-card filming gallery was added to DEMO; the newly registered card is separate from that gallery. No code, deployment or screenshot changes were made in this documentation update.

## English-first documentation with preserved Japanese sources

The user requested English for human-readable repository documentation, retention of Japanese, and commit/push to main. Codex translated README files, specifications, design and verification records, OpenSpec artifacts, asset guides, and prompt-record guides. English is the default path; Japanese originals are retained as labeled `.ja.md` snapshots with reciprocal navigation. The root README and ENS UI design also have newly translated Japanese versions.

OpenSpec delta translations are stored under each change's `translations/` directory so the parser does not read duplicate requirements. Japanese cross-links now point to Japanese documents where available. A pre-existing broken OpenSpec link was corrected. Captured prompt JSON, supplied `.txt` transcripts, raw evidence, application language behavior, and artwork are unchanged. The former CLI recipient options and the iPhone recovery issue remain unresolved; translation does not imply implementation work.

Only human-readable OpenAPI title, summary, and description fields changed. The API schema and example values were compared after excluding those fields and remained identical. Generated artifacts were refreshed, generation checks passed, and all 78 API tests passed. The documentation verifier checked 57 language pairs and 908 local links, including source hashes for preserved Japanese text. Strict OpenSpec validation passed all three items. An independent gpt-5.6-sol review found no blocking translation or preservation issues.

The language policy and reproducible checks are in [documentation languages](../docs/LANGUAGES.md). Historical documents retain their original evidence and limitations; current behavior remains defined by [SPEC.md](SPEC.md).
