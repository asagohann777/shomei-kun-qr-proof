English | [日本語](LICENSE_POLICY.ja.md)

# MIT license for source code

On 2026-09-26, the user chose MIT for this repository's source code and accompanying technical documentation. Previously there was no root LICENSE, and OwnershipRegistry.sol was UNLICENSED.

- The root [LICENSE](../LICENSE) contains the MIT text and `Copyright (c) 2026 Shomei-kun QR Proof contributors`.
- Add SPDX identifiers to tracked JS, TS, Solidity, Python, CSS, and shell sources. Keep shebangs first and retain existing author notices.
- Update the OpenAPI generator to emit the same identifier.
- Do not manually edit Next.js-generated `next-env.d.ts`.
- Set MIT in the three package.json files and root lockfile metadata. Dependency licenses remain unchanged.
- This grant excludes supplied images, logos, cards, external materials and conversation quotations, and the existing Shomei-kun code and brand. Image materials were provided by [Ojii-chan Convenience Store / asagohann777](https://github.com/asagohann777). Permissions for individual assets still require separate confirmation.
- A source-license change does not update a deployed contract. Recompilation may change Solidity metadata, but does not rewrite existing deployments or evidence.

MIT text source: https://opensource.org/license/mit . Checked on 2026-09-26.

The human selected MIT and the README wording changes. Codex prepared the LICENSE, identifiers, package metadata, and records. The relationship of this work to the hackathon period is unconfirmed.

## Verification results

Checked identifiers in 76 files and confirmed that processing logic was unchanged except for generated headers. Dependencies in all three packages were unchanged. OpenAPI generated-output consistency checks passed. Solidity compilation passed. The ABI, creation code, and runtime code were unchanged except for trailing metadata, then `contracts/abi/OwnershipRegistry.json` was regenerated. Regenerated-output comparison passed. No deployment was performed.
