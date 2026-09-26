English | [日本語](CURVEGRID_INTEGRATION_IMPLEMENTATION.ja.md)

# Curvegrid implementation and verification record

2026-09-26 JST. After approval of detailed design `453387e`, rebased onto main `cdb1ffe`, including the latest UI, and implemented in PR #1. The original UI workspace and `prototypes/mobile-ui` were unchanged.

## Implemented functions

- `contracts/src/OwnershipRegistry.sol`: fixed issuer, card-ID/allowed-wallet issuance, one-time registration by the permitted wallet, queries, and events.
- `contracts/cli`: deployment, issuance, queries, and resume. Local signing, saving state with mode 0600 before submission, and explicit resend of the same transaction.
- `apps/web/src/backend`: live MultiBaas Gateway, deployment settings, unsigned-calldata validation, and transaction/receipt/event/canonical-block verification.
- API: retained the existing three paths and added `GET /api/v1/connection` and CORS. Distinguishes live free input, missing configuration, authentication rejection, and timeout.
- `wrangler.integration.jsonc`: dedicated `shomei-kun-integration` configuration selected separately from the existing mock.

Share the Solidity-generated ABI between CLI and API. Generate public types and Workers validators from OpenAPI. Test-specific configuration keeps real credentials out of local live-diagnostic tests.

## Verification results

Executed with Node.js 22.23.1. Reproduction commands are in the [runbook](CURVEGRID_INTEGRATION_RUNBOOK.md) and [CLI instructions](../contracts/README.md).

| Check | Result |
| --- | --- |
| Web API service/input/configuration/Gateway | 63 passed |
| Next.js HTTP | 25 mock and 4 live-diagnostic tests passed |
| Local Cloudflare Workers HTTP | 25 mock and 4 live-diagnostic tests passed |
| Solidity/CLI local EVM and MultiBaas-format tests | 15 passed, including 3 actual CLI terminal tests |
| Type checks | Web API and CLI passed |
| Regenerated ABI match | Passed |
| OpenAPI | Validated 4 operations, 55 response examples, 19 existing mock scenarios, and 10 invalid inputs |
| Next.js / dedicated OpenNext build | Passed |
| OpenSpec strict validation | Passed |

CLI terminal tests used a newly generated encrypted test keystore and local EVM. Resumed after a post-deployment linking failure, then issued and queried without redeployment. Fixed raw mode and input-listener setup before password entry, and tested that input did not appear in terminal output.

The restricted environment could not capture Next.js child-process output and failed to read TypeScript configuration. Rebuilt locally with normal permissions. Fixed HTTP-test type inference with an explicit Response type. No external deployment was performed.

MultiBaas API formats were taken from official SDK documentation and tested with synthetic responses, not fixtures from a real environment. Live public RPC, API keys, permissions, synchronization, and phone signing remain unverified.

## Dependencies and remaining checks

Web API npm audit had zero findings, as did CLI runtime dependencies. Hardhat and other development dependencies retain 18 findings: 5 high, 2 moderate, and 11 low. Applied compatible fixes without additional major upgrades. Hardhat is excluded from the public Worker.

Actual MultiBaas connectivity, contract deployment, dedicated URL publication, phone MetaMask return, and another-device verification were not performed. They remain in section 6 of [OpenSpec tasks](../openspec/changes/curvegrid-testnet-integration/tasks.md). Do not mark A07, independent verification on a public chain, complete.

## Human and AI roles

The user selected requirements and responsibilities, approved the detailed design, and requested the rebase onto the latest UI. Codex created the API, contract, CLI, tests, configuration, generated files, and instructions. Separate agents handled contract/CLI and Gateway work. The parent handled HTTP/OpenAPI/integration/change records and reran contract tests. An independent read-only review found real configuration leaking into tests, which was isolated through a test environment file.

The relationship of this work to the hackathon period is unconfirmed. Existing Shomei-kun code and user data were unchanged.
