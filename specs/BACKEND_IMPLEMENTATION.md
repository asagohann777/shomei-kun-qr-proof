English | [日本語](BACKEND_IMPLEMENTATION.ja.md)

# Fixed mock API implementation and verification

2026-09-26 JST. Implement according to the [detailed design](BACKEND_DESIGN.md), without connecting the existing static UI mock or PoC. This document records that implementation stage, not the current live integration status.

## Implementation steps

- [x] how: inspect the starting point. No API code exists; the static UI mock is separate under `prototypes/mobile-ui/`.
- [x] architect skipped: the approved detailed design already defines structure, DTOs, and verification conditions, so do not compare architectures again.
- [x] Blocking first steps: review the detailed design, OpenAPI, and Next.js/Cloudflare compatibility.
- [x] Independent workstreams: the implementation worker owns `apps/web/src/`; the parent owns configuration, generated code, tests, and documentation.
- [x] Shared mutable state: create scenarios per request. Workers do not edit the same files.
- [x] Smallest safe decomposition: assign API handling and Gateway implementation to one worker. The parent verifies them with independent tests.
- [x] Delegate code-writing: implement Route Handlers, Service, Mock Gateway, and the Mock Wallet operation library.
- [x] Verify: check input validation, record matching, state isolation, OpenAPI consistency, and HTTP responses on Next.js and Workers.
- [x] Update implementation status and rerun instructions.
- Rebase/commits and Opening a PR were skipped. The user requested implementation, not commit, push, PR creation, or publication.
- interrogate was skipped. The architecture was approved, and selecting alternatives was outside this task.

## Implementation details

The API application lives in `apps/web/`. Generate DTOs, samples, scenario tables, and JSON Schema validators from OpenAPI. Generate Ajv validation functions before the build so Workers does not generate code dynamically.

Next.js Route Handlers handle the HTTP boundary. The Service verifies Gateway transactions, receipts, events, and card state. The Mock Wallet library simulates approval, rejection, and confirmation; it is not integrated into the existing screens.

The Cloudflare configuration implements the OpenNext proposal in the [architecture](ARCHITECTURE.md). Check [official OpenNext setup instructions](https://opennext.js.org/cloudflare/get-started) and npm peerDependencies, then pin compatible versions. No deployment is performed.

## Verification record

Versions used: Node.js 22.23.1, Next.js 16.3.6, TypeScript 5.9.3, OpenNext Cloudflare 1.20.6, and Wrangler 4.140.0. TypeScript 7 does not satisfy the OpenAPI type generator's peerDependencies, so TypeScript was pinned to 5.9.3.

| Coverage | Test location | Checks |
| --- | --- | --- |
| B01, B02 | HTTP, boundary, service | Unissued and registered cards, chain, allowed wallet, sample nickname, and validation/error priority |
| B03, B04 | HTTP | Repeated and concurrent requests do not mutate state or mix scenarios |
| B05, B06 | Service, HTTP | Transaction, receipt, event, and current-state mismatches; reverts; missing data; pending confirmation; network failures |
| B07 | Service, HTTP | Preserve the owner while evidence is pending; receipt events can confirm a registration before indexed search catches up |
| B08 | Boundary Mock Wallet tests | Do not query confirmation after rejection or automatically resend an unknown outcome; screen integration is outside scope |
| B09 | Service, boundary | Mock Gateway and Wallet work when fetch is forced to fail; no live modules are included |
| B10 | Boundary, HTTP | JSON, type, format, scenario, UTF-8, Content-Type, and 16 KiB body boundaries, independent of spoofed Content-Length |
| B11 | HTTP, config, generation checks | All 19 scenario responses match OpenAPI examples and schemas; explicit mock mode, rejection of missing/live configuration, and rejection of mock headers in live mode |

Tests are in [apps/web/tests](../apps/web/tests/); rerun instructions are in the [README](../apps/web/README.md). All 36 service, input-boundary, configuration, and Mock Wallet tests passed. All 24 HTTP tests passed on Next.js and the same 24 passed on local Workers. Results are saved for [Next.js](assets/backend/http-next.txt) and [Workers](assets/backend/http-worker.txt).

On Workers, OpenNext adds `private, no-cache, no-store, max-age=0, must-revalidate` to 404 responses. Four initial tests failed because they expected an exact string. OpenAPI and the tests were changed to require `no-store` while allowing additional directives, preserving the no-storage requirement.

In the restricted environment, asynchronous subprocess output was empty and Next.js failed to read its TypeScript configuration. The build ran locally with normal permissions. Node tests used `--experimental-test-isolation=none` so individual cases were visible. Counts do not merely count successful test files.

Following Type System Discipline, public DTOs were generated from OpenAPI. Following Model the Domain, discriminated types represent card and transaction results, and each request owns its scenario-specific Gateway. Following Prove It Works, HTTP requests were sent to local servers in addition to type checking and builds. These checks do not establish successful live integration.

OpenAPI static validation, generated-file comparison, type checking, Next.js builds, and OpenNext Worker bundle generation also passed. No screen captures were taken because the existing UI was unchanged. Physical phones, real wallets, MultiBaas/Amoy, the issuer CLI, the existing PoC, and deployment were not tested at this stage.
