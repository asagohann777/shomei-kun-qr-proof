# ENS and wallet card search

## Current deployment

Live app: https://shomei-kun-integration.dptr.workers.dev/ui/
Validation app: https://shomei-kun-ens-validation.dptr.workers.dev/ui/

The app resolves ENSv2 names on Sepolia and reads card registrations on Curvegrid Testnet. QR scanning remains the main entry point. ENS is optional: direct address searches, QR lookup and unrestricted issuance work without ENS configuration.

## Search

The home action is `ENS名・アドレスで探す` / `Find by ENS or address`. Enter an ENS name or wallet address to see cards registered to the resulting wallet. Select a card to open its existing details and registration evidence. Viewing does not require a wallet connection or gas.

`GET /api/v1/ens/cards?name=INPUT&cursor=OPTIONAL_CURSOR` returns the normalized input, address, ENS chain ID, card registry, snapshot block/hash, verified records, `complete` and `nextCursor`. The historical parameter is called `name`, but it accepts addresses too. Direct address searches skip ENS and return null `ensChainId`.

The API filters `CardRegistered` events by indexed owner. One request scans up to four ranges of at most 2,000 blocks and returns up to 20 verified records. Provider range-limit errors split the range. Other failures remain errors. Each returned record must match its transaction, canonical receipt and current registered owner. The cursor fixes the chain, contract and snapshot and records the last block/log index. A changed ENS target or snapshot requires a new search. A partial empty page does not claim that the wallet has no registered cards.

Changing an ENS address changes future searches, but does not select who can register a new card. It never rewrites an existing card. No card subnames, new ENS Registry/Resolver deployment or persistent search database are used.

## Registration Primary name

`GET /api/v1/ens/primary-name?address=ADDRESS` reads the wallet's Primary name on Sepolia and forward-resolves it. A matching name appears above the connected address in the registration screen. Missing names, mismatches, unconfigured ENS and network failures return a null name and retain the address display. This lookup never blocks registration.

Account changes and disconnects immediately clear the previous name. A generation counter prevents an old response from replacing the current wallet's display. Registration permissions, signed transactions and stored ownership remain address-based. The wallet does not need to switch to Sepolia for this server-side lookup.

## Unrestricted issuance

The user removed ENS recipient restrictions from the requirements on 2026-09-26. ENS is optional for search and verified name display only. New cards use the zero address for `allowedWallet`; any wallet can perform the first registration. ENS configuration is not required for issuance or registration.

The current CLI still accepts the old `--recipient-ens` and `--wallet` options. Their removal is pending implementation. Until then, omit both options when issuing new cards. Existing contracts, previously issued restricted cards and signed transaction state are preserved. The earlier restricted-card experiment below is historical evidence, not the current feature scope.

## Runtime settings and transport

Set optional server-only `ENS_SEPOLIA_RPC_URL` to a trusted public HTTPS Sepolia RPC. The resolver checks chain ID 11155111. Credential-bearing URLs stay out of Git and browser bundles. The server uses the MultiBaas application key, never the issuer/admin key.

ethers 6.17.0 handles normalization and ENSv2 resolution. CCIP requests are limited to three public HTTPS endpoints with request timeouts. Worker configuration retains `global_fetch_strictly_public`. Both RPC and CCIP fetches use manual redirects and reject HTTP 3xx responses. This is required because Cloudflare Workers rejects fetch's redirect error mode.

Official integration reference: https://docs.ens.domains/ensv2/tutorial-app-developers/

## Mock preview

At the local mock, open `/?preview=ens` or the home search button. `shomeikun.eth` and valid addresses show fixture cards, `empty.eth` shows zero results and `error.eth` shows an upstream failure. No API request is made. The screen labels the results as samples.

`/?scenario=wallet-ready` previews the registration screen with a name; `/?scenario=wallet-ready&primary=unset` previews address-only display. The user requested removal of the in-screen preview toggle.

## Verification and remaining checks

On 2026-09-26, real Sepolia calls verified that `shomeikun.eth` resolves to `0xc22D961e56b70a73f6dCB1EC0a47b7Da1Fe38FDd`, and reverse lookup returns that name with the same forward address. Validation and integration Workers passed these checks after the redirect-mode fix.

Chromium verified the public ENS search and WebKit verified the public address search. Both opened existing registered card details without JavaScript errors. The latest submission capture contains three real registered cards, including `test-20260926-006`, which appeared after the user reported successful testing. The user reported that PC Chrome and mobile MetaMask can operate the same wallet. The user confirmed that the latest successful manual test used PC Chrome with MetaMask. The later unrestricted-card registration report is recorded below.

Local checks covered recipient confirmation/recheck/resume, reverse-forward mismatch and failure fallback, stale account responses, bounded pagination, reorg restart, direct-address search without ENS configuration, optional API behavior, mock states and mobile layouts. Full details are in `HACKATHON_CHANGES.md`. Mock screenshots and live screenshots have separate capture metadata.

After explicit approval, the actual CLI issued `ens-shomeikun-20260926-01` with `--recipient-ens shomeikun.eth`. Transaction `0xa7cf862b4f592c745f75340dd43ab198bbe57334ab8c8b9f3ef23fd438b4c96f` succeeded at block 19313 on Curvegrid Testnet. The CLI state records the Sepolia ENS name and the fixed recipient `0xc22D961e56b70a73f6dCB1EC0a47b7Da1Fe38FDd`. RPC and the public API confirm that the card exists and is unregistered. Read-only `eth_call` simulation accepted that recipient and reverted for another wallet. No user registration transaction was sent during verification.

Test card: https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=ens-shomeikun-20260926-01

The user subsequently reported that the iPhone app crashed during the test and displayed "結果を確認できません" after reopening. The public card API still returned `unregistered` with no registration evidence when checked after the report. This does not rule out a pending transaction. The user later reported approving with a different wallet and seeing no transaction in MetaMask activity. The crash cause is not established. Recovery of this saved unknown attempt remains unresolved. PC Chrome + MetaMask was confirmed by the user. Prize eligibility is not established solely by these checks.


## Successful unrestricted demo registration

To continue filming without changing the old attempt, the issuer created `demo-open-20260926-02` with zero-address `allowedWallet`. Issuance transaction: `0xfdabf3a162863b3ce55348e1cf488d9b58ed58f29ca2ff96ca9a222b88760d95`.

The user then reported successful registration in the ongoing iPhone demo session. A subsequent public API read confirmed owner `0xc22d961e56b70a73f6dcb1ec0a47b7da1fe38fdd`, nickname `Tkg`, and available evidence at block 19315. Registration transaction: `0xaa931283722cd2fc2dc3959ca1268275f58b5cfda3ca281593221a2624a0d5b8`. This confirms the new card's registration; it does not establish that crash recovery or every physical-device ENS scenario passed.

Registered card: https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=demo-open-20260926-02
