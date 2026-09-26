English | [日本語](PRE_EXISTING_WORK.ja.md)

# Pre-existing work

## Known facts

Shomei-kun is an existing project in the Tennchiai project. According to the user, an individual-user PoC existed before the hackathon. This repository starts from that project and creates a reference implementation and demo for an additional QR-based registered-owner lookup.

When preparation began on 2026-09-25, this repository had no commits or implementation files. That does not mean the existing Shomei-kun project had no prior work. Its source code was not reviewed or ported for this work.

## Existing functions documented on 2026-09-25

This table is based on the user's descriptions of existing materials. The original materials, applicable version, and actual behavior are unverified. The website alone was not used to claim implementation.

| Existing function or element | User-provided description | Treatment here |
| --- | --- | --- |
| Photo/video registration | Select device photos/videos and register captured data | Existing work, not counted as new |
| Album management | Organize registered data into albums | Existing work, not the main modification target |
| Public/private visibility | Users select visibility | Existing work. Do not change visibility of existing data |
| Third-party presentation | Present proof information through shared URLs | Do not claim the idea or existing sharing function as new |
| Blockchain evidence | Handle verification data and registration/proof information corresponding to registered data | Existing mechanism. Do not claim reuse of its code or storage destination |
| Existing users and stored data | Users, photos/videos, albums, and proof records | Do not delete, initialize, or publish without authorization |

The planned new scope comprises unique card IDs, QR verification pages, registration authorization through an issuer CLI, registration by the user's wallet, card-owner association records, and third-party verification. This is not a claim that those functions are already implemented.

## Sources and reuse

| Source | Review scope | Reuse and rights |
| --- | --- | --- |
| [Tennchiai project website](https://tennchiai.com/) | On 2026-09-25, reviewed its explanation of democratizing proof, records, and external evidence | Used for background. No website code/images were ported. Usage permission is unverified |
| [User requirements and existing-function description](../docs/prompts/2026-09-25/121716-439190-2cd0d9f92aa8468588e7978b39382568.json) | PoC existence, existing functions, new scope, F01–F10, screens, and specified technologies | Reflected in specifications. Original existing materials and their versions remain unverified |
| Existing PoC source/data | Unverified. Location and target commit were not identified | No port or connection. License unverified |
| Shomei Ichiro card image | Codex created a new SVG for the UI mock, without importing an existing image | [player.svg](../prototypes/mobile-ui/public/player.svg). No real player's photograph was used. Project publication license was undecided |

Data integration with the existing PoC is not a completion requirement. Before future integration, review the APIs, data, and permissions again.

## Record before reference or reuse

- Source URL and target commit or version.
- Scope of existing code, specifications, designs, and images.
- Files referenced or reused in this repository and the changes made.
- Copyright, license, and permitted publication scope.
- Preparation performed for this repository before the hackathon.

These details and the participation track are unconfirmed. Calling this a reference implementation does not establish it as new work.
