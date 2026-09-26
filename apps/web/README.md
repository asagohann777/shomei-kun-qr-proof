English | [日本語](README.ja.md)

# Run the Shomei-kun API

This Next.js and TypeScript API retrieves cards, prepares registration, and checks registration results. `mock` returns fixed responses. `live` reads Curvegrid Testnet records through MultiBaas. The user's wallet signs and sends transactions. The startup example below uses mock mode. The [shared UI](../../prototypes/mobile-ui/README.md) normally uses mocks; its integration build connects to the real API and MetaMask.

## Start the server

Use Node.js 22. Run these commands from the repository root.

```sh
cd apps/web
npm ci
cp .env.example .env.local
npm run dev
```

Set `BACKEND_MODE=mock`. The server does not start if the value is missing or unknown. Mock mode needs no API key or private key. See the live setup link below for real connections. The root `/` redirects to `/ui/`. The integration build bundles the UI.

## Retrieve a card

```sh
curl -i http://localhost:3000/api/v1/cards/SK-2026-001
curl -i -H 'X-Mock-Scenario: unregistered' \
  http://localhost:3000/api/v1/cards/SK-2026-001
```

The first request returns a registered sample; the second returns an unregistered sample. The response has `meta.mode: mock`.

## Prepare and check registration

```sh
curl -i -X POST \
  -H 'Content-Type: application/json' \
  -H 'X-Mock-Scenario: unregistered' \
  --data '{"walletAddress":"0x7a31000000000000000000000000000000008f42","chainId":80002,"nickname":"おじいちゃんコンビニ"}' \
  http://localhost:3000/api/v1/cards/SK-2026-001/registration/prepare

curl -i -H 'X-Mock-Scenario: pending' \
  http://localhost:3000/api/v1/cards/SK-2026-001/transactions/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

curl -i -H 'X-Mock-Scenario: registered' \
  http://localhost:3000/api/v1/cards/SK-2026-001/transactions/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

`data: "0x"` is a mock value. Do not send it to a real wallet. The Mock Wallet is in `src/backend/mock-wallet.ts`. After rejection, do not call confirmation. Do not resend when the outcome is unknown. The real UI passes only live transactions to the wallet.

Specify the scenario for each request. A successful preparation request does not change the card lookup response. The omitted scenario, `default`, is a standalone success example for each API. See the [scenario table in the detailed design](../../specs/BACKEND_DESIGN.md#fixed-samples-and-scenarios) for supported combinations.

## Verify the API

Run these commands in `apps/web/`.

```sh
npm run generate:check
npm run typecheck
npm test
BACKEND_MODE=mock npm run build
npm run test:http
BACKEND_MODE=mock npm run build:worker
npm run test:worker
```

`test:http` starts Next.js on port 3107. `test:worker` starts a local Wrangler Worker on port 8789. Both stop their server after testing. In restricted environments, allow local ports and child processes. These commands do not deploy to a public environment.

To operate the local Worker manually, run `npm run build:worker`, then `npm run preview`. This uses the mock settings in `wrangler.jsonc`. It requires no R2, D1, or MultiBaas connection.

## Change the API contract

After editing [OpenAPI](../../specs/openapi.yaml), update the generated files.

```sh
npm run generate
npm run typecheck
npm test
```

Output goes to `src/generated/`. Commit the types, samples, scenarios, and schema validators. The build fails if generated files are stale. Ajv generates validators ahead of time, so Workers do not call `eval` or `new Function`.

The [implementation and verification record](../../specs/BACKEND_IMPLEMENTATION.md) maps tests to requirements. Distinguish these tests from real signing, Amoy, and MultiBaas tests.

## Connect to Curvegrid Testnet

The implementation adds `BACKEND_MODE=live`, a connectivity-check API, a MultiBaas Gateway, and a dedicated Worker configuration. See the [Curvegrid integration runbook](../../specs/CURVEGRID_INTEGRATION_RUNBOOK.md) for configuration, UI connection, and verification steps. Existing fixed mock responses remain available. A successful connection requires real environment keys and deployment settings.

## Find wallet cards through ENS or an address

`GET /api/v1/ens/cards?name=NAME&cursor=OPTIONAL_CURSOR` resolves Sepolia ENS names and returns verified Curvegrid registration records. The `name` parameter also accepts a wallet address, which skips ENS resolution. Set the optional server-only `ENS_SEPOLIA_RPC_URL` to enable ENS. Other endpoints and direct address search do not require ENS configuration. See [ENS integration](../../specs/ENS_INTEGRATION.md) and the OpenAPI contract for response fields, restart behavior, and errors.
