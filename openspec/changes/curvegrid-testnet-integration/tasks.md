English | [日本語](tasks.ja.md)

# Tasks

The detailed design is approved. See specs/HACKATHON_CHANGES.md for the approval record. The UI owner continues screen design in parallel. Additional instructions include API and browser SDK connections in this PR.

## 1. Design review

- [x] 1.1 Obtain the user's detailed-design review and save the reviewed commit SHA and approval reference in the change log. Use that record to verify permission to start implementation.

## 2. Contracts and shared interfaces

- [x] 2.1 Pin compatible Solidity and Hardhat versions and Paris settings, and verify successful compilation.
- [x] 2.2 Implement issue/register/getCard and events, and pass the detailed design's C05 permission, boundary, and race tests on a local EVM.
- [x] 2.3 Save ABI artifacts and contract procedures, and verify identical ABI output after recompilation.
- [x] 2.4 Add the connection API, variable live chain ID and name, and new errors to OpenAPI, then generate types, validators, and fixtures. Pass existing mock-response and new request/response example validation, and document the UI connection contract.

## 3. Configuration and MultiBaas Gateway

- [x] 3.1 Implement mock/live configuration and Secret boundaries, and pass C02 missing-setting, invalid-setting, and redaction tests. Confirm that example configuration contains no real keys.
- [x] 3.2 Implement REST calls, deadlines, authentication, and invalid-response handling. Test that 401/403/404/429/5xx, delays, and invalid JSON do not become success or unregistered state.
- [x] 3.3 Implement state reads and ABI conversion, and pass C04/C08 tests for unissued, registered, empty events, and search failures.
- [x] 3.4 Implement unsigned transaction creation and ABI comparison, and pass C06 rejection tests for changed from/to/chain/value fields and arguments.
- [x] 3.5 Implement transaction, receipt, block, and log comparison. Pass C07 pending/reverted/unknown/confirmed and communication-failure tests. Document upstream response-conversion rules.

## 4. API and dedicated Worker configuration

- [x] 4.1 Connect the live Gateway and free-form input validation to the existing Service, and pass C01/C04 mock-compatibility, UTF-8, body-limit, and scenario-header tests.
- [x] 4.2 Implement GET connection and CORS, and pass C02/C03 connection-state, allowed-origin, rejected-origin, OPTIONS, and no-store tests.
- [x] 4.3 Add dedicated Worker configuration and startup instructions. Pass Next.js and local Workers HTTP tests, type checks, and builds. Confirm by diff that existing Worker names and configuration are unchanged.

## 5. Issuer CLI

- [x] 5.1 Implement encrypted-keystore loading, unsigned-transaction comparison, signing preparation, and state storage. Pass tests for key-leak prevention, storage permissions, exclusion, and saving before submission.
- [x] 5.2 Implement deploy and ABI linking. Pass C09 tests for interruption after deployment, resume, reuse of the same Library, mismatch rejection, and startingBlock preservation.
- [x] 5.3 Implement issue/show/resume and test C09 same-card reruns, different allowed recipients, ambiguous submission results, and explicit resending of the same transaction.
- [x] 5.4 Save CLI configuration, operation, and resume procedures, and verify that the documented commands can run in sequence locally.

## 6. Live environment and UI integration

- [x] 6.1 After receiving connection settings, verify permissions and real responses and add sanitized MultiBaas fixtures to contract tests. Revise the design for unknown formats rather than guessing ready status.
- [ ] 6.2 After deployment and publication instructions, deploy the contract and dedicated Worker. Measure C10 connection checks, owner registration, reload, and reads on another device.
- [ ] 6.3 Check C11/C12 with the UI owner and record smartphone MetaMask transition, return, rejection, disconnection, requery, and display results.
- [x] 6.4 Record actual chain/contract/card/hash/block values, date and time, unmet conditions, and AI scope in the change log. Confirm that the records trace C10/C11 and do not wrongly mark A07 complete.

## 7. Connect the latest main UI

- [x] 7.1 Design modes, registration states, and parallel-work boundaries against the latest main UI.
- [x] 7.2 Implement build-time API/wallet switching and verify default mock, live read-only mode, and invalid-combination rejection.
- [x] 7.3 Connect existing screens to the real API and display owner, evidence, card ID, and communication failures.
- [x] 7.4 Implement MetaMask connection, chain switching, owner-transaction comparison and signing, and account changes.
- [x] 7.5 Verify saved submission state, repeated-click prevention, queries after return, rejection, failure, and unknown results.
- [x] 7.6 Verify mock regression, live browser tests, and 320px/390px/desktop display. Deploy the UI to the dedicated URL and record measured scope and remaining conditions.

## 8. Open-registration demo and diagnostics

- [x] 8.1 Default to unrestricted registration while preserving owner signatures and first-registration-only constraints.
- [x] 8.2 Deploy a new contract and unregistered demo cards, and measure public API preparation, event, and transaction comparisons.
- [x] 8.3 Add and verify error request IDs, structured logs, and diagnostic copying on smartphones.

## 9. Registration wait and post-registration refresh

- [x] 9.1 Wait up to sixty seconds for initial transaction and evidence confirmation, distinguishing unconfirmed from confirmed results.
- [x] 9.2 Separate refresh from registration and update only status.
- [x] 9.3 Verify boundaries and browser display, publish to the dedicated URL, and record results.
