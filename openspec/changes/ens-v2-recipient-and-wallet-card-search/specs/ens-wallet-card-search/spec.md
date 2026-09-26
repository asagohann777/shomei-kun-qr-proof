# Spec Delta

## Purpose
ENS名で受取人のウォレットを指定してカードを発行し、名前の解決先に登録されたカードを検索する。既存のQRと任意アドレス発行を維持する。

## ADDED Requirements

### Requirement: Optional ENS recipient
CLI SHALL accept an optional ENS recipient, mutually exclusive with a wallet address, and preserve unrestricted issuance when neither is provided.
#### Scenario: Existing invocation
- **WHEN** issuance omits ENS
- **THEN** wallet-specific or unrestricted issuance works without ENS configuration
#### Scenario: ENS issuance
- **WHEN** an ENS name resolves to a nonzero EOA and the issuer confirms it
- **THEN** only that address is allowed to register the card
#### Scenario: Name changed or failed
- **WHEN** resolution fails or changes before signing
- **THEN** issuance stops without sending a transaction
#### Scenario: Resume
- **WHEN** a saved ENS issuance is resumed after its name changes
- **THEN** the saved transaction and address are preserved without re-resolution

### Requirement: Wallet registration search
The system SHALL resolve a name on Sepolia ENSv2 and list verified registrations for the resulting wallet in the configured Curvegrid registry, without a connected wallet.
#### Scenario: Search and view
- **WHEN** a name resolves to a wallet with registrations
- **THEN** the list links to existing card records and says cards registered to this wallet
#### Scenario: Excluded cards
- **WHEN** a card is unregistered or registered to another address
- **THEN** it is not included
#### Scenario: Changed address
- **WHEN** an ENS record changes during pagination
- **THEN** continuation is rejected and a fresh search is offered

### Requirement: Complete and verifiable results
The system SHALL paginate address-filtered registration events and verify them against transactions, receipts, and card state. It SHALL NOT present an incomplete or failed search as zero registrations.
#### Scenario: More results
- **WHEN** unsearched blocks or entries remain
- **THEN** the response includes a continuation cursor and the UI offers further searching
#### Scenario: Reorganization or invalid evidence
- **WHEN** the snapshot hash changes or evidence fails verification
- **THEN** search fails visibly rather than omitting the record
#### Scenario: Empty complete result
- **WHEN** every block in the snapshot has been searched successfully with no registrations
- **THEN** the UI reports no cards registered to this wallet

### Requirement: Existing QR compatibility
The system SHALL keep QR scanning as the primary action and preserve card ID links, registration and public viewing even when ENS is unavailable.
#### Scenario: ENS outage
- **WHEN** ENS has missing configuration or an upstream error
- **THEN** existing QR and registration operations continue independently

### Requirement: Optional verified primary name display
The registration screen SHALL look up the connected wallet's Primary name on Sepolia and SHALL display it as the primary label only after forward resolution matches that wallet. The address SHALL remain visible as secondary text. Missing names, mismatches and lookup failures SHALL retain the existing address display and SHALL NOT prevent registration. Wallet changes and disconnects SHALL discard the previous name and any stale pending result. Registration permissions and stored ownership SHALL remain address-based. Mock mode SHALL support both name-present and name-unset previews.

#### Scenario: Matching reverse and forward records
- **WHEN** the connected address reverses to a name and the name resolves back to that address
- **THEN** registration displays the verified name above the address

#### Scenario: Failed or mismatched lookup
- **WHEN** the primary name is absent, fails to resolve, or resolves to another address
- **THEN** registration displays the address and remains operable

#### Scenario: Account switch during lookup
- **WHEN** the connected wallet changes while a primary-name lookup is pending
- **THEN** the previous name clears immediately and the previous lookup cannot overwrite the new wallet display

### Requirement: Direct wallet address search
The same search input SHALL accept a valid wallet address as well as an ENS name. Address searches SHALL skip ENS resolution and SHALL work without ENS RPC configuration. They SHALL apply the same registry, event, receipt and pagination checks as ENS searches. Direct responses SHALL set ensChainId to null. The UI SHALL identify the input as an ENS name or wallet address.

#### Scenario: Address search without ENS configuration
- **WHEN** the user searches a valid address and ENS is not configured
- **THEN** the application searches registrations for that address without contacting ENS

#### Scenario: Invalid address
- **WHEN** a query starts with 0x but is not a valid address
- **THEN** validation rejects it instead of resolving it as an ENS name
