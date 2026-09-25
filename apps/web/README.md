# 固定モックAPIを動かす

Next.js・TypeScriptによる、カード取得・登録準備・登録確認のAPIです。MultiBaas、ウォレット署名、Amoyへの送信はモックです。登録結果は保存しません。相談用の[静的UI](../../prototypes/mobile-ui/README.md)は独立しており、このAPIへ接続していません。

## 起動

Node.js 22を使います。リポジトリのルートから実行してください。

```sh
cd apps/web
npm ci
cp .env.example .env.local
npm run dev
```

`BACKEND_MODE=mock` が必須です。未指定・`live`・未知の値では起動しません。APIキーや秘密鍵は不要です。ルート `/` に画面はありません。

## カード取得

```sh
curl -i http://localhost:3000/api/v1/cards/SK-2026-001
curl -i -H 'X-Mock-Scenario: unregistered' \
  http://localhost:3000/api/v1/cards/SK-2026-001
```

先頭は登録済み、後者は未登録のサンプルを返します。応答の `meta.mode` は `mock` です。

## 登録準備と確認

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

`data: "0x"` は模擬値です。実ウォレットへ送信しないでください。Mock Walletは `src/backend/mock-wallet.ts` にあります。拒否後は確認を呼ばず、結果不明でも再送しません。既存UIへの組込みは別の作業です。

シナリオは要求ごとに指定します。準備の成功でカード取得結果が変わることはありません。省略時の `default` は各API単体の成功例です。利用できる組合せは[詳細設計のシナリオ表](../../specs/BACKEND_DESIGN.md#固定サンプルとシナリオ)を参照してください。

## 検証

`apps/web/` で実行します。

```sh
npm run generate:check
npm run typecheck
npm test
BACKEND_MODE=mock npm run build
npm run test:http
BACKEND_MODE=mock npm run build:worker
npm run test:worker
```

`test:http` はNext.jsをポート3107、`test:worker` はWranglerのローカルWorkersをポート8789で起動し、検証後に終了します。ネットワーク接続を制限した実行環境では、ローカルポートと子プロセスを許可して実行してください。公開先へのデプロイは行いません。

Workersを手動で操作する場合は `npm run build:worker` の後に `npm run preview` を実行します。`wrangler.jsonc` のモック設定を使います。R2・D1・MultiBaasへの接続は不要です。

## API定義を変更する

[OpenAPI](../../specs/openapi.yaml)を編集した後、生成物を更新してください。

```sh
npm run generate
npm run typecheck
npm test
```

生成先は `src/generated/` です。型、サンプル・シナリオ、スキーマ検証関数をGitへ含めます。ビルドは生成物が古い場合に失敗します。検証関数はAjvで事前生成し、Workers上で `eval` や `new Function` を呼びません。

[実装と検証の記録](../../specs/BACKEND_IMPLEMENTATION.md)に試験の対応を記載します。実際の署名・Amoy・MultiBaasの試験とは区別してください。
