English | [日本語](qr-proof-decisions.ja.md)

# Decisions from QR registration exploration

Source: the Codex conversation in this repository on 2026-09-25. Codex manually transcribed questions and answers from `request_user_input`. This is not automatic hook capture. Exact times for each answer were not recorded.

At the time of writing, hook JSON contained the initial request, the correction to mobile support, and the instruction to execute the plan. The selected answers below were added manually because they were absent from those JSON files. This is not a record of internal AI reasoning or the entire conversation. Questions, options, and quoted answers below are English translations; the Japanese version preserves their recorded wording.

## Nickname storage

Question: "How should the nickname be linked to the registration information?"

Options:

- "Store the string on-chain too (Recommended)": record the public nickname with the owner, with no changes or deletion after registration. This keeps the demo smaller.
- "Store the string elsewhere": record a verification hash on the blockchain. Also design string storage, verification, and unavailable-data display.

User's answer: "Store the string on-chain too (Recommended)."

## Relationship to the existing PoC

Question: "Should completion include actual data integration with the existing Shomei-kun PoC?"

Options:

- "Independent additional-feature demo (Recommended)": demonstrate using only this repository's CLI, contract, and demo. Record PoC integration as a future extension.
- "Include integration with the existing PoC": connect existing records or screens to card registration. Confirm source code, APIs, and permissions before specifying the integration.

User's answer: "Independent additional-feature demo (Recommended)."

## Registration environment and correction

Question: "Which environments should support owner registration in the demo?"

Options:

- "MetaMask on mobile and PC (Recommended)": connect a normal mobile browser to the MetaMask app and use the extension on PC. Demonstrate the flow from QR to registration.
- "PC MetaMask extension": register on a prepared PC and demonstrate QR viewing on mobile. Reduce connection implementation and verification scope.
- "Multiple wallet types": support wallets beyond MetaMask. Add wallet selection and connection tests for each supported wallet.

Initial answer: "PC MetaMask extension."

Later user correction: "Sorry, please use mobile after all." The original contains a typo retained in the Japanese version.

The adopted scope is registration through a normal mobile browser connected to the MetaMask app, not PC-only registration. The correction is also preserved in the [hook record](2026-09-25/122429-037897-c475cb8e8fd244c08302e2043f25f922.json).

## External verification

Question: "How much external verification is required by F08?"

Options:

- "Transaction information and verification procedure (Recommended)": display supporting transaction information and provide a procedure for independent third-party verification through a public RPC.
- "Require a public explorer too": require a transaction page that third parties can open without logging in. Check whether Curvegrid provides one.

User's answer: "Transaction information and verification procedure (Recommended)."

## Plan adoption

After receiving a plan reflecting those choices, the user said, "Implement the plan." See the [hook record](2026-09-25/122651-114438-1fe83e01648547c1a4e98d4f8cc0ec12.json).

The adopted plan is stored in [specs/PLAN.md](../../specs/PLAN.md). That task covered specifications, design, and demo documentation, not application implementation.
