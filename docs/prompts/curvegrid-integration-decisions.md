English | [日本語](curvegrid-integration-decisions.ja.md)

# Curvegrid integration decisions

Codex manually summarized the selected answers on 2026-09-26 JST. This is neither a verbatim question transcript nor an automatic hook capture.

| Topic | User's selection |
| --- | --- |
| Target | Start with Curvegrid Testnet; the MultiBaas environment already exists and will be configured later |
| Test scope | Include registration and writes |
| Contract | Implement a new owner-registration contract |
| Mobile operation | Connect to MetaMask from a normal browser |
| Nickname | Replace the fixed sample with free-form input |
| Parallel development | This work covers API, contract, and CLI; the UI developer handles screens and browser MetaMask integration |
| Process | Create a branch and PR; save the plan in Markdown first, and implement after the user reviews the detailed design |

The [plan](../../specs/CURVEGRID_INTEGRATION_PLAN.md) records these selections. The 96-byte nickname limit and module structure were Codex design proposals, not conditions individually specified by the user.

The corresponding hook JSON files use 2026-09-25 UTC prefixes `201954`, `202746`, and `203111`. They were copied unchanged from the original checkout into the dedicated worktree. The originals were not deleted or rewritten. This document does not claim that selected answers or AI plans are present in the hook records.
