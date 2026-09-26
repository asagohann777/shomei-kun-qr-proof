English | [日本語](SPEC.ja.md)

# Shomei-kun QR owner registration

This service uses a card's QR code to show its currently registered owner. A card for the fictional baseball player Shomei Ichiro records the user's wallet and nickname.

## Scope and what the record proves

- The current demo uses Curvegrid Testnet. MultiBaas API reads state and prepares transactions. MetaMask signs and sends them.
- Only issued, unregistered cards can be registered. New cards have no wallet restriction. Only the first registration is stored.
- The owner and nickname are public. Changes, deletion, and transfers after registration are not provided.
- The record proves the association between a card ID and its registered wallet. It does not establish physical possession, authenticity, or a real name. A copied QR code shows the same record.
- This app does not connect to the existing Shomei-kun project's photo/video registration, albums, visibility settings, or stored data. [PRE_EXISTING_WORK.md](PRE_EXISTING_WORK.md) records that work.

## Roles

| User | Actions |
| --- | --- |
| Issuer | Issues card IDs through the CLI. Cannot overwrite an owner or sign for a user |
| Registrant | Connects MetaMask, reviews the nickname and public information, and registers |
| Third party | Views cards, owners, and registration evidence without connecting a wallet |

## Functional requirements

| ID | Requirement |
| --- | --- |
| F01 | Identify a card by its chain, contract, and card ID. Reject duplicate IDs and registration of unissued cards |
| F02 | Put the public page URL in the QR code. Include no private keys, credentials, or nicknames |
| F03 | Only the fixed issuer can issue cards. A newly issued card is unregistered. New cards allow everyone and have no ENS-name or recipient-address restriction |
| F04 | Check the wallet's actual address and chain. Do not treat a manually entered address as action by that wallet's owner |
| F05 | Accept only transactions signed by the registrant. The contract rejects duplicate registration and overwrites |
| F06 | Nicknames contain 1–96 UTF-8 bytes. Store them in the same transaction as the owner. Allow the same nickname on different cards |
| F07 | Read public information from the chain. Show the same record after reloads and on other devices |
| F08 | Expose the chain, contract, card ID, issuer, and registration transaction for RPC verification |
| F09 | Distinguish unissued, unregistered, processing, confirmed, failed, and unverifiable states. Never turn a network failure into unregistered or success |
| F11 | Search an ENS name or wallet address for cards registered to that address. Allow viewing without a wallet connection |
| F12 | Reverse-resolve the Sepolia Primary name on the registration screen. Show the name prominently only when forward resolution matches. On failure, keep the address and allow registration |
| F13 | ENS is optional for search and name display. Do not use it to restrict card registration. New cards allow all wallets |
| F10 | Keep specifications, plans, prompts, change history, test results, and AI-use records in the repository |

## Screens and actions

The app supports phones, iPads, and PCs. QR scanning is the main action. ENS-name and address search is secondary. There is no issuer web screen.

| Screen | Actions |
| --- | --- |
| QR scan | Press the button to start the camera. Read QR codes automatically or select a photo |
| Card/public verification | Show the card image, ID, and registration state. Continue to registration for an unregistered card, or show the owner and evidence for a registered card |
| Card search | Enter an ENS name or address, then open details and registration records from the list. Distinguish incomplete searches from zero results |
| Owner registration | Enter a nickname, prepare the wallet, consent to publication, and review the registration |
| Registration progress | Show awaiting approval, checking the record, completed, rejected, failed, and unknown-result states |

### Camera

Images and video are analyzed on the device. Accept only the target public page URL or card API URL. Do not navigate to external URLs. Stop the camera after a successful read, screen navigation, or page hiding. The user resumes it after returning. See [accepted formats and stop conditions](CAMERA_SCAN.md).

### Wallet

In an external browser on iPhone or iPad, use **Open in MetaMask** on an unregistered card to open the same card in MetaMask's browser. Enter the nickname after switching. If the page does not open, copy the card URL into MetaMask's browser.

Connect directly inside MetaMask. Other external browsers use MetaMask Connect. After connecting, check the chain and request network addition or switching only when necessary. Show connection preparation separately from the registration transaction.

Before registration, explain that the nickname and wallet become public and cannot be changed or deleted afterward. Do not provide real-name, email, or owner-address input fields.

### Registration and refresh

After the first submission, check the transaction result and evidence for up to 60 seconds. If the transaction and owner are confirmed but evidence indexing is delayed, show the evidence state on the completion screen. If transaction success cannot be confirmed, show an unknown result.

Do not label a registered card's load or refresh as registration in progress. Keep the card and owner visible during refresh and update only the status area. On reload or app return, query the saved transaction without automatically resending it.

### Language

Allow Japanese/English switching and save the choice. Without a saved choice, use the first matching Japanese or English language in browser preference order, otherwise English. Do not translate nicknames, IDs, or addresses.

## Operating modes

| API | Wallet | Behavior |
| --- | --- | --- |
| mock | mock | UI review. No external API or real wallet connection |
| live | mock | Read-only access to real data |
| live | metamask | Registration with the user's wallet |

The default is mock/mock. Reject mock API combined with a real wallet. Camera mode is independent, `UI_CAMERA_MODE=mock|live`. Never fall back to mock data after a live connection failure.

## Acceptance criteria

| ID | Verification |
| --- | --- |
| A01 | Issuance permissions, duplicate IDs, and unregistered state immediately after issuance |
| A02 | Rejection of unissued cards, accepted QR formats, and camera stop/resume |
| A03 | Actual address/chain matching and account-change detection |
| A04 | Only the first registration succeeds, including repeated taps, other tabs, and direct transactions |
| A05 | Publication consent, nickname limits, and storage in the same transaction as the owner |
| A06 | The same owner is returned without a wallet connection, on another device, and after reload |
| A07 | The screen matches RPC state, registration events, and receipts |
| A08 | Rejection, failure, indexing delays, and network errors stay distinct. No automatic resend |
| A09 | iPhone/iPad entry into MetaMask's browser and the user's connection and approval |
| A10 | Japanese/English switching and persistence, with 320px, 390px, iPad, and desktop layouts |
| A11 | Traceable implementation, tests, prompts, existing work, and AI use |
| A12 | Issuance, QR reading, registration, and address search work without ENS configuration. New cards do not restrict the registrant |
| A13 | An ENS name and its resolved address return the same search results. Existing registration records open from the list |
| A14 | Forward verification of Primary names, address fallback on lookup failure, and discarding old names/responses on wallet changes |

See [ARCHITECTURE.md](ARCHITECTURE.md) for the architecture, [DEMO.md](DEMO.md) for the demonstration, and [HACKATHON_CHANGES.md](HACKATHON_CHANGES.md) for test results.

## ENS and address search

ENS is optional. Names use Sepolia, while card registration uses Curvegrid Testnet. Address input searches registration events without ENS. The registration screen uses a Primary name only after matching forward resolution and clears the old name on wallet changes. Ownership and permissions use addresses. ENS changes never rewrite existing cards.

Acceptance covers matching ENS/address results, continued conventional operation when ENS is absent or unavailable, forward verification, stale-response rejection on account changes, and restarting paginated searches after address changes or chain reorganization. [ENS_INTEGRATION.md](ENS_INTEGRATION.md) records details and live results.

## Requirement changes and implementation status on 2026-09-26

ENS-restricted recipient issuance is removed from the requirements. New cards allow everyone, and ENS only assists search and display. The current CLI still has the old `--recipient-ens` and `--wallet` options. Their removal is unfinished. Existing contracts and previously restricted cards are unchanged.

The user reported successful registration of unrestricted card `demo-open-20260926-02`. The public API also confirmed registration with evidence. The old card's "結果を確認できません" message after app termination remains unresolved. Successful registration of another card does not establish that recovery is fixed.
