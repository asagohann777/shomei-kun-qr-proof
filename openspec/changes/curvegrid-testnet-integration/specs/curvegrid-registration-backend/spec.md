English | [日本語](../../translations/curvegrid-registration-backend/spec.ja.md)

# Curvegrid registration backend

## Purpose

Provide wallet-owner card registration and public verification with Curvegrid Testnet and MultiBaas. Preserve the UI mock and handle connection preparation, registration transactions, and evidence refresh separately.

## ADDED Requirements

### Requirement: Explicit destination and mode
The system MUST declare mock or live mode. Live mode MUST use only the Curvegrid Testnet and contract specified in deployment configuration and MUST NOT fall back to mock mode on failure.

#### Scenario: Missing live configuration
- **WHEN** live mode is selected but required connection settings are missing
- **THEN** the API returns 503 CONFIGURATION_MISSING with only missing field names and no fixed success data

#### Scenario: Invalid mode
- **WHEN** BACKEND_MODE is absent or is neither mock nor live
- **THEN** it is a configuration error and no connection begins

#### Scenario: Chain mismatch
- **WHEN** the MultiBaas, RPC, and expected chain IDs differ
- **THEN** connection checks and registration preparation return 503 CONNECTION_MISMATCH without a transaction

### Requirement: Connection state for the UI
The connection API MUST return the retrieved chain, latest block, deployment target, and public Web3 settings. It MUST NOT return server API keys or administrative keys.

#### Scenario: Successful connection check
- **WHEN** configuration, authentication, chain, RPC, deployment target, ABI, and issuer checks pass
- **THEN** return mode=live, status=ready, and public network, registry, and latestBlock fields

#### Scenario: Upstream authentication rejection
- **WHEN** MultiBaas returns 401 or 403
- **THEN** return 503 MULTIBAAS_AUTH_FAILED without exposing the upstream body or keys

### Requirement: One-time issuance by the issuer
The contract MUST permit only the fixed issuer to issue card IDs. It MUST NOT overwrite an issued ID or its allowed wallet.

#### Scenario: Successful issuance
- **WHEN** the issuer issues a valid unused ID with an allowed wallet
- **THEN** the card becomes unregistered and an issuance event is recorded

#### Scenario: Duplicate, unauthorized, or invalid ID
- **WHEN** issuance is attempted with an existing ID, another issuer, or an out-of-range ID
- **THEN** the contract rejects it without changing the original card

### Requirement: First registration by the wallet owner
The contract MUST accept only transactions for issued, unregistered cards whose sender is permitted to register and controls the sending wallet. It MUST associate owner and nickname with the same transaction and MUST NOT provide re-registration, transfer, cancellation, or overwriting.

#### Scenario: Registration by a permitted wallet owner
- **WHEN** the owner sends register with a valid nickname for an unrestricted card or a card restricted to that wallet
- **THEN** save the owner and name and record an event associating the card, owner, and name

#### Scenario: Competing registrations or impersonation
- **WHEN** there are multiple transactions for the same card, an unissued ID, an unauthorized sender, or re-registration of a registered card
- **THEN** only the first registration satisfying the conditions succeeds and all others are rejected

### Requirement: Free-form input and unsigned transactions
The live API MUST treat nicknames as 1–96 UTF-8 bytes and MUST NOT normalize them without permission. Preparation MUST return only an unsigned transaction whose destination and ABI contents have been checked, without signing or sending.

#### Scenario: Successful preparation
- **WHEN** an unregistered card receives a permitted address, correct chain ID, and name within limits
- **THEN** return a transaction with verified register cardId and name arguments and from/to/chain/value fields, without changing chain state

#### Scenario: Invalid input
- **WHEN** a name is empty, exceeds 96 bytes, or contains invalid Unicode, or the body is oversized, contains unknown fields, specifies another chain, or uses a disallowed wallet
- **THEN** reject with the defined 400/413/422 response and do not return an unsigned transaction

#### Scenario: Unexpected MultiBaas response
- **WHEN** the response has submitted=true, mismatched destination, call, or arguments, or an invalid format
- **THEN** return 503 rather than convert it to success

### Requirement: Public reads without wallet connection
The API MUST retrieve card state and owner without a connected wallet. It MUST distinguish unissued cards, unregistered cards, pending evidence, and communication failures.

#### Scenario: Unissued card
- **WHEN** a successful contract read returns exists=false
- **THEN** return 404 CARD_NOT_FOUND without automatic issuance

#### Scenario: Evidence indexing delay
- **WHEN** a registered owner is retrieved and a successful event search is empty
- **THEN** retain the owner and return evidence=pending

#### Scenario: Unrecognized MultiBaas 404 or communication failure
- **WHEN** an upstream 404 has no verified absence semantics, or an upstream failure or malformed response occurs
- **THEN** return 503 without converting it to unregistered or transaction-not-found

### Requirement: Compare transactions with current records
The API MUST return confirmed only when the transaction, ABI arguments, receipt, canonical block logs, and current card record match.

#### Scenario: Correct registration transaction
- **WHEN** the card's successful transaction, correct event, current owner and name, and blockHash match
- **THEN** return confirmed, owner, registration hash, and blockNumber

#### Scenario: Mismatched record
- **WHEN** cardId, function, sender, destination, name, event emitter, hash, or block differs
- **THEN** return unknown/RECORD_MISMATCH rather than confirmed

#### Scenario: Pending and failed transactions
- **WHEN** the target register transaction has isPending=true or its failure receipt is verified
- **THEN** return pending for the former and reverted for the latter, separately from communication failure

#### Scenario: Recheck
- **WHEN** a submitted hash is queried repeatedly
- **THEN** compare the records again at that time without sending a new transaction

### Requirement: CLI resume and key separation
The issuer CLI MUST handle signing keys locally and save resume information before sending. Resume MUST NOT automatically create a different transaction.

#### Scenario: Interrupted linking after deployment
- **WHEN** the deployment transaction succeeds and the CLI stops before ABI linking
- **THEN** resume verifies the existing deployment, resumes only linking, and sets startingBlock to the original deployment block

#### Scenario: Repeated issuance command for the same card
- **WHEN** issuance is rerun with the same ID and allowed wallet
- **THEN** return existing state without sending a transaction, and fail if the wallet differs

#### Scenario: Ambiguous submission result
- **WHEN** a communication failure after submission prevents confirmation
- **THEN** query the saved hash, do not resubmit solely because of communication failure, and do not expose the private key or signed raw transaction

### Requirement: Separate URL and UI compatibility
The backend MUST use a different Worker from the existing UI mock. It MUST grant CORS only to allowed UI origins and preserve the existing mock's three APIs and fixed scenarios.

#### Scenario: Request from a separate UI origin
- **WHEN** the configured UI origin requests the API or preflight
- **THEN** return the corresponding CORS headers and reject disallowed origins with 403

#### Scenario: Existing mock usage
- **WHEN** the existing nineteen scenarios run in mock mode
- **THEN** return their existing fixed responses without external API connections

### Requirement: Switchable mock and live UI
The UI MUST select API and wallet modes through environment variables. It MUST default to mock/mock, treat live/mock as read-only, and reject mock/metamask as a configuration error.

#### Scenario: Continue UI design
- **WHEN** the regular mock build is used
- **THEN** existing display scenarios work without real API or wallet connections

#### Scenario: Owner performs real registration
- **WHEN** in live/metamask mode the owner reviews public information and approves a verified transaction
- **THEN** the wallet signs and sends, and the result becomes confirmed only after API record comparison

#### Scenario: Leave the page during submission
- **WHEN** the page reopens after obtaining a submission hash or with its result unknown
- **THEN** resume only queries for the saved target, without automatic signing or new submission

### Requirement: Unrestricted demo registration

When a demo card's allowedWallet is the zero address, the contract MUST accept first registration from any wallet owner. The issuance CLI defaults to unrestricted when the option is omitted. Signatures and immutability after first registration remain required.

#### Scenario: First registration by any participant
- **WHEN** any wallet owner registers an unrestricted, unregistered card
- **THEN** the sender becomes the owner and subsequent registrations, including those from other wallets, are rejected

### Requirement: Insufficient balance during preparation

When MultiBaas register preparation returns the observed insufficient-funds response, the API MUST report 422 INSUFFICIENT_FUNDS. It MUST NOT infer insufficient funds from unknown upstream errors.

#### Scenario: Preparation blocked by insufficient gas
- **WHEN** a zero-balance wallet prepares registration and MultiBaas returns 400 insufficient funds for transfer
- **THEN** the UI guides the user to add test ETH without requesting a signature or sending a transaction

### Requirement: QR reading from camera and photos
The UI MUST start the camera on user action and decode QR codes on-device. It MUST accept only supported card URLs and MUST NOT upload images or video. Camera mode has independent mock/live configuration.

#### Scenario: Successful QR read
- **WHEN** video or a photo contains a supported public-page or card-API URL
- **THEN** open that card ID in the current app and stop the camera

#### Scenario: Return from a hidden page
- **WHEN** a page with an active camera becomes hidden and later returns
- **THEN** stop the camera while hidden and wait for user action to resume after return

#### Scenario: Camera permission unavailable
- **WHEN** the camera cannot start
- **THEN** offer retry and photo reading without simulated success

### Requirement: In-app registration on iPhone and iPad
The live UI MUST open the same card in MetaMask's browser from an external iPhone or iPad browser. It MUST NOT include input or connection information other than the card ID in the link.

#### Scenario: Open an unregistered card in an external browser
- **WHEN** an iPhone or iPad has no MetaMask provider
- **THEN** show Open in MetaMask before input and pass the same card URL through a direct dapp link, without automatically starting SDK connection

#### Scenario: iPad uses desktop mode
- **WHEN** the device reports Macintosh identification and multiple touch points
- **THEN** identify it as an iPad and show the same app-navigation flow

#### Scenario: In-app browser does not open
- **WHEN** the user opens the page-opening help
- **THEN** show the same card's HTTPS URL and copy action, with instructions for pasting it into MetaMask

#### Scenario: Open inside MetaMask
- **WHEN** a MetaMask provider exists
- **THEN** proceed to owner connection and registration without asking to switch apps again

### Requirement: Separate connection preparation from registration
The UI MUST separate connection, network addition, and network switching from registration transactions. Preparation MUST NOT create or send a registration transaction.

#### Scenario: Prepare the network
- **WHEN** the connected wallet is on a different chain
- **THEN** request switching and offer network addition only after an unsupported-chain response

#### Scenario: Switch to the app during approval
- **WHEN** the page becomes hidden during approval
- **THEN** stop the next approval request and compare state on return, without overlapping requests

#### Scenario: Response remains unknown
- **WHEN** a preparation response remains unknown after sixty foreground seconds
- **THEN** show a waiting state and a recheck action without assuming cancellation or successful connection

### Requirement: Initial registration wait and evidence refresh
The UI MUST check transactions and evidence for up to sixty seconds after initial registration. It MUST NOT show retrieval of a registered card as registration in progress.

#### Scenario: Only evidence indexing is delayed
- **WHEN** transaction success and owner match but evidence is not searchable within sixty seconds
- **THEN** show registration complete and evidence pending separately

#### Scenario: Transaction success cannot be confirmed
- **WHEN** transaction success cannot be confirmed within sixty seconds
- **THEN** show an unconfirmed result without automatic resubmission

#### Scenario: Refresh a registered card
- **WHEN** the user refreshes evidence
- **THEN** keep the card and owner and update only the status, preserving retrieved information even on failure
