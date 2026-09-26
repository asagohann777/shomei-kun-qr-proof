[English](CURVEGRID_INTEGRATION_RUNBOOK.md) | 日本語

# Curvegrid連携の起動とUI接続

APIは `apps/web`、コントラクトと発行者CLIは [contracts](../contracts/README.md) にある。画面とMetaMaskの接続コードは `prototypes/mobile-ui` にある。通常buildはmockを維持し、専用integration buildだけ実APIへ接続する。[UI接続の設定・実測](UI_LIVE_CONNECTION_REPORT.md)を参照。

## ローカルで起動する

Node.js 22で実行する。

```sh
cd apps/web
npm ci
BACKEND_MODE=mock npm run dev
```

`GET /api/v1/connection` は `mode:mock` と `status:mock` を返す。既存3 APIの固定応答と `X-Mock-Scenario` を使用できる。mockの取引をウォレットへ送らない。

実接続用の起動は `BACKEND_MODE=live npm run dev`。設定不足なら503 `CONFIGURATION_MISSING` を返す。値を固定モックで補わない。`.env.local` に以下を設定する。ファイルはGit管理外である。

| 設定 | 値の取得元 |
| --- | --- |
| `BACKEND_MODE` | `live` |
| `PUBLIC_API_ORIGIN` | ローカルなら `http://localhost:3000` |
| `ALLOWED_UI_ORIGINS` | UIのOriginをカンマ区切り。空なら同一Originのみ |
| `MULTIBAAS_BASE_URL` | 自分のMultiBaas配置URL。末尾は `/api/v0` |
| `MULTIBAAS_API_KEY` | 読取り・未署名取引作成に限定したサーバー用キー |
| `CHAIN_ID` | 自分のCurvegrid Testnetの実値 |
| `CURVEGRID_PUBLIC_WEB3_RPC_URL` | 専用の公開Web3キーで作成したRPC URL |
| `REGISTRY_ADDRESS` / `REGISTRY_ISSUER` | CLI配置後のアドレス・発行者 |
| `REGISTRY_CONTRACT_LABEL` / `REGISTRY_CONTRACT_VERSION` | MultiBaasへ登録したLibraryのラベル・バージョン |
| `REGISTRY_DEPLOYMENT_BLOCK` | 配置成功receiptのブロック番号 |

管理RESTキーや発行者秘密鍵を `NEXT_PUBLIC_*`、UI設定、会話、PRへ入れない。公開Web3 URLはMetaMaskに渡す用途のためブラウザから見える。

## UIからAPIを呼ぶ

APIの形式は [OpenAPI](openapi.yaml) が正である。UIのAPI base URLに専用バックエンドのOriginを指定する。クロスOrigin要求はcredentialsなしで送る。未登録でもウォレット接続前にカードを読める。

1. `GET /api/v1/connection` を呼ぶ。`meta.mode === "live"` と `data.status === "ready"` の場合だけネットワーク設定を使う。
2. `GET /api/v1/cards/{cardId}` でカードを読む。404は未発行。503を未登録表示に置き換えない。
3. MetaMaskから実アドレスとchain IDを取得する。ユーザーが公開情報に同意した後、以下を送る。

```http
POST /api/v1/cards/{cardId}/registration/prepare
Content-Type: application/json

{"walletAddress":"<MetaMaskのアドレス>","chainId":2017072401,"nickname":"おじいちゃんコンビニ"}
```

`2017072401` は現在のintegrationのチェーンID。別の配置では接続応答・ウォレットの実値を使う。ニックネームは1〜96 UTF-8バイト。空白除去やUnicode正規化を行わない。

4. 応答のmode、chainId、from、to、valueとregisterの引数をABIで照合する。署名前に接続アドレスとchain IDを再取得し、変更されていたら準備をやり直す。
5. `data.transaction` をMetaMaskへ渡す。`chainId` は数値、`value` は10進wei文字列なので、EIP-1193要求へ渡す際に16進数量へ変換する。nonce・gas・手数料はウォレットに委ねる。
6. 送信hashを取得したら、chainId、contractAddress、cardId、hash、入力したnicknameを保存する。`GET /api/v1/cards/{cardId}/transactions/{hash}` で照合する。

`pending` は照会を続ける。`confirmed` は表示名・所有者が入力と一致するか確認する。`reverted` は失敗、`unknown` は理由codeに従って確認する。通信失敗はHTTPエラーとして表示する。復帰時は同じhashの照会を再開し、新しい取引を自動送信しない。hash取得前に切断した場合は送信結果不明とし、MetaMask履歴からhashを確認する。

## Cloudflareの専用構成

`wrangler.integration.jsonc` は `shomei-kun-integration` 専用。既存mockの `wrangler.jsonc` とUI用Workerを変更しない。配置の指示を受けてから、Cloudflare側の変数へ上記の公開設定・配置設定を登録し、`MULTIBAAS_API_KEY` はSecretとして保存する。

ビルドとローカル検証は公開せずに実行できる。

```sh
UI_CAMERA_MODE=live BACKEND_MODE=live npm run build:integration
npm run test:worker:live
```

`test:worker:live` は接続情報を持たない専用設定で、設定不足・CORS・mock指定拒否をローカルWorkers上で検証する。公開UIは `https://shomei-kun-integration.dptr.workers.dev/ui/`。

## 検証を再実行する

```sh
cd contracts
npm ci
npm run compile
npm run check:abi
npm test
cd ../apps/web
npm ci
npm run generate:check
npm run typecheck
npm test
BACKEND_MODE=mock npm run build
npm run test:http
npm run test:http:live
BACKEND_MODE=mock npm run build:worker
npm run test:worker
UI_CAMERA_MODE=live BACKEND_MODE=live npm run build:integration
npm run test:worker:live
```

`live-gateway.test.ts` は合成応答、`live-recorded.test.ts` は今回のTestnetで取得したMultiBaas応答を使う。RPCのchain/codeは後者でも合成応答。設定提供後の疎通・スマホ署名・別端末確認は [実装タスク](../openspec/changes/curvegrid-testnet-integration/tasks.md) 6章で追跡する。

## 実接続の設定とビルド

`build:integration` と `build:worker` はOpenNextが取り込んだローカル環境値をビルド後に除去する。接続設定はWorkerの実行時bindingから供給する。生成物のキー・RPC値の検査に失敗した場合はデプロイしない。

Workerに設定するのは `MULTIBAAS_BASE_URL`、アプリ用 `MULTIBAAS_API_KEY`、`CHAIN_ID`、`REGISTRY_ADDRESS`、`REGISTRY_CONTRACT_LABEL`、`REGISTRY_CONTRACT_VERSION`、`REGISTRY_DEPLOYMENT_BLOCK`、`REGISTRY_ISSUER`、`CURVEGRID_PUBLIC_WEB3_RPC_URL`、`PUBLIC_API_ORIGIN`、`ALLOWED_UI_ORIGINS`。`.env.local` 全体をbulk登録しない。`MULTIBAAS_ADMIN_API_KEY`、キーストア、パスワードはCLI側だけで使用する。

実測カードと再現コマンド、残る確認は [疎通試験記録](CURVEGRID_CONNECTIVITY_REPORT.md) を参照。

### integrationでのカメラ試験

専用integrationは `UI_CAMERA_MODE=live` でビルドする。`apps/web/.env.local` にも同じ設定を保存できる。既定値はmockのままなので、UI検討用ビルドではカメラ権限を要求しない。

公開 `/ui/` の「QRコードをスキャン」からカメラを許可し、既存カードのQRを読み取る。写真からの読取りも利用できる。登録するまでは取引を送信しない。

公開ビルドの確認は `prototypes/mobile-ui` で `node scripts/verify-camera-public.mjs` を実行する。Chromiumで動画のQRを読み取り、WebKitでカメラ拒否後に写真を読む。API応答は試験内で503に置き換え、読取りIDの引渡しと通信失敗表示を確認する。実カードの発行・登録は行わない。
