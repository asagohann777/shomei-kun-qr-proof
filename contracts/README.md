English | [日本語](README.ja.md)

# Owner registration contract and issuer CLI

The issuer creates card IDs, and a wallet registers each card once. New demo cards allow registration from any wallet. The contract also retains its earlier restricted-wallet capability. The current requirement uses ENS only for optional search and name display, not to restrict registration. Issuer replacement, edits after registration, transfers, and deletion are not supported. The UI's MetaMask integration handles the registering user's signature.

## Verify locally

Use Node.js 22. CLI terminal tests also use Python 3's standard-library `pty` module.

```sh
cd contracts
npm ci
npm run compile
npm run check:abi
npm run typecheck
npm test
npm run issuer -- --help
```

The project pins Solidity 0.8.30, Hardhat 2.29.1, and EVM Paris. It uses the local solc version pinned through npm. The generated `abi/OwnershipRegistry.json` contains the ABI, deployment bytecode, and runtime bytecode. `check:abi` checks that recompilation produces the same output.

Tests use a local Hardhat EVM to check permissions, IDs, nickname length, concurrent registration, and the CLI's save-before-send, interruption, and resume behavior. MultiBaas HTTP tests use specification-based fixtures. They do not prove a real Curvegrid connection. Verify live response formats and permissions separately.

## Configure the issuer

Set the following environment variables. The CLI does not load `.env` automatically. Do not store API keys or decryption passwords in command history or Git.

| Variable | Value |
| --- | --- |
| `MULTIBAAS_BASE_URL` | HTTPS management API URL ending in `/api/v0` |
| `MULTIBAAS_ADMIN_API_KEY` | Admin key permitted to register Library entries, prepare deployment, link, read, and prepare issuance |
| `CURVEGRID_PUBLIC_WEB3_RPC_URL` | Public Web3 RPC for the target chain |
| `CHAIN_ID` | Actual chain ID |
| `REGISTRY_ISSUER` | Issuer address in the local keystore |
| `REGISTRY_CONTRACT_LABEL` | MultiBaas Library label |
| `REGISTRY_CONTRACT_VERSION` | Library version |
| `REGISTRY_ADDRESS` | Deployed contract address, required for issue and show |
| `PUBLIC_API_ORIGIN` | Public verification API origin |
| `ISSUER_KEYSTORE_PATH` | Encrypted JSON keystore path; also accepted through `--keystore` |

Use an encrypted Ethereum JSON keystore managed by its owner. The terminal hides the decryption password as you enter it. This CLI does not generate, retrieve, or store private keys.

## Deploy and issue

The following operations write to the chain. An operator must confirm the settings and deployment authorization before running them.

```sh
mkdir -m 700 .issuer-state
npm run issuer -- deploy --state .issuer-state/deploy.json --keystore /secure/issuer.keystore.json
```

For `pending`, continue checking with the same state. Set `REGISTRY_ADDRESS` to the contract in the `complete` result. Obtain the ABI link's starting block from the original deployment receipt.

```sh
npm run issuer -- resume --state .issuer-state/deploy.json
npm run issuer -- issue --card-id demo-001 --state .issuer-state/demo-001.json --keystore /secure/issuer.keystore.json
npm run issuer -- show --card-id demo-001
npm run issuer -- resume --state .issuer-state/demo-001.json
```

Omit recipient flags to issue an unrestricted card. If a card already exists with the same allowed wallet, the CLI returns `already-issued` without sending a new transaction. The allowed wallet cannot be changed. The returned cardUrl is a verification API URL, not the UI's QR link.

## Resume after interruption

Before signing, the CLI checks the chain, issuer, calldata, destination, and transfer value. It obtains the nonce, gas, and fees from RPC. It atomically saves the signed transaction to a state file with mode 0600 before sending it.

The state contains no private key, but it can be used to rebroadcast the signed transaction. Do not publish it. `.issuer-state/` is excluded from Git. Keep equivalent access restrictions when moving state files.

`resume` checks the same hash. For a deployed contract, it resumes ABI linking. Only when a successful lookup cannot find the transaction and returns `not-seen` may an operator choose to rebroadcast the same signed transaction.

```sh
npm run issuer -- resume --state .issuer-state/deploy.json --rebroadcast
```

Do not resend after a communication failure. Stop if the nonce has already been consumed. Check the issuer account's history before starting again with a new state file. Do not run multiple deployment or issuance commands concurrently with the same issuer.

A `.lock` prevents concurrent operations on the same state. If a crash leaves the lock behind, confirm that no issuer process remains, then remove only the lock. Do not delete the state.

The CLI does not print raw upstream errors, keys, or signed transactions. On failure, check the configuration, permissions, saved state, and MultiBaas dashboard. Use `resume` to check the transaction state.

## Basis for MultiBaas formats

The implementation follows `ContractOverview`, `ListContractVersions200ResponseAllOfResult`, `Contract`, `Address`, `EventIndexingStatus`, and `TransactionToSignTx` in the [official SDK](https://github.com/curvegrid/multibaas-sdk-typescript/tree/main/docs). It does not treat arbitrary 404 responses as proof of absence. It reports an unregistered entry only after a successful listing request. It stops if an existing Library entry has a different ABI or bytecode, or if the linked version or indexing start block differs.

## Unrestricted demo registration

Omitting `--wallet`, as in `issue --card-id ID --state FILE --keystore FILE`, allows any wallet to register. Contract 1.1.0 uses the zero address in allowedWallet to represent this permission. Any user's wallet may perform the first registration, and the signed transaction's sender becomes the owner. An existing registration cannot be overwritten.

## Legacy recipient restrictions

The CLI still accepts `--wallet ADDRESS` to restrict registration and `--recipient-ens NAME` to resolve a restricted recipient on Sepolia. These options remain in the implementation pending removal; they are not part of the current demo requirement. Do not use either option when issuing new demo cards.

For the retained ENS option, `ENS_SEPOLIA_RPC_URL` configures resolution. The CLI requires address confirmation and resolves again before signing. Resume uses the saved recipient without a new lookup. See [ENS integration](../specs/ENS_INTEGRATION.md) for the current search and display requirements and the status of legacy behavior.
