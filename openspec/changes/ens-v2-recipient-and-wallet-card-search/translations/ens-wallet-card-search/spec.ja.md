[English](../../specs/ens-wallet-card-search/spec.md) | 日本語（原文保存版）

# Spec Delta

## Purpose
ENS名またはアドレスから登録カードを検索し、接続中ウォレットの検証済みPrimary nameを表示する。ENSは任意で、新規カードは登録先を限定せず、既存のQR登録・閲覧を維持する。

## ADDED Requirements

### Requirement: Unrestricted issuance independent of ENS
New card issuance SHALL allow any wallet to perform the first registration and SHALL NOT require ENS configuration or a recipient name. ENS SHALL be used only for optional search and verified name display. Existing issued cards and recorded ownership SHALL remain unchanged.
#### Scenario: Issue without ENS
- **WHEN** the issuer creates a new card without ENS configuration
- **THEN** issuance succeeds without restricting the registration wallet
#### Scenario: Wallet without an ENS name
- **WHEN** a wallet without an ENS name registers a newly issued unregistered card
- **THEN** the normal first-registration flow remains available
#### Scenario: ENS target changes
- **WHEN** an ENS name resolves to a different address
- **THEN** new searches use that address without changing existing registration records or restricting new card issuance

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
