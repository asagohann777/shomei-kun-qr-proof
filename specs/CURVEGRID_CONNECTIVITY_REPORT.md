# Curvegrid疎通試験と課題

2026-09-26 JST。対象はPR #1の `bcfcede`。実環境疎通の依頼を受けて確認したが、MultiBaasの接続設定が見つからず、外部チェーンへの試験は未実施。ローカルAPIの起動成功を実環境の疎通成功には数えない。

## 最新mainの取込み

ユーザーの指示で `git pull --rebase origin main` を実行した。取得できた `origin/main` は `cdb1ffe`。対象ブランチは取り込み済みで、追加リベース・競合・履歴変更はなかった。

## 実行した確認

| 確認 | 実測結果 |
| --- | --- |
| 接続設定の有無 | 専用worktree・元の作業場所のルート、apps/web、contractsの `.env*` / `.dev.vars*` とシェル変数を確認。MultiBaas関連設定なし。値は出力していない |
| live API起動 | `BACKEND_MODE=live PUBLIC_API_ORIGIN=http://127.0.0.1:3108 npm run start -- --hostname 127.0.0.1 --port 3108` で起動 |
| `GET /api/v1/connection` | 503、`meta.mode=live`、`CONFIGURATION_MISSING`、`Cache-Control: no-store` |
| `GET /api/v1/cards/connectivity-check` | 同じ503。未発行・未登録の判定やカード発行はしていない |
| 登録準備へのOPTIONS | 204。同一Originを許可し、GET/POSTとContent-Typeのpreflightに応答 |
| Cloudflare専用Worker | 外部ネットワーク権限で `wrangler deployments list --config wrangler.integration.jsonc` を実行。`shomei-kun-integration` は未存在、Cloudflare code 10007 |

Cloudflareの結果は専用Workerの不存在であり、認証情報の不正やMultiBaasの障害とは判断しない。APIは固定mockへ切り替わらず、設定不足で停止した。既存UI用Workerは変更していない。

## 課題と対応

| ID | 分類 | 課題・影響 | 次の対応 |
| --- | --- | --- | --- |
| C-01 | 実測した阻害要因 | MultiBaas接続設定がなく、チェーンへ到達できない | 設定済みファイルの場所を確認する。未設定ならgit管理外の `apps/web/.env.local` へ設定する |
| C-02 | 実測した未配置 | 専用Workerがなく、別URLから呼べない | 接続確認後、専用構成へ変数・Secretを登録して配置する |
| C-03 | 書込み試験の前提 | 配置先・発行者・許可ウォレット・署名手段が未提供。コントラクトの実際の配置有無は未確認 | 既配置ならその情報を設定。新規配置ならCLI用管理キー、発行者キーストア、ガス代を準備する。復号パスワードは本人が端末入力する |
| C-04 | 未検証 | MultiBaasの実応答形式、権限、ABIリンク、イベント同期の互換性が未確認 | 接続後に実応答を検証し、機密情報を除いたfixtureと結果を保存する |
| C-05 | UI結合の前提 | このPRはAPI・コントラクト・CLIを担当。既存のUIモックは実MetaMask署名へ未接続 | UI担当と接続先・実ウォレット・スマホ復帰の試験を合わせる |
| C-06 | ローカル起動の注意 | `next start` がstandalone構成用serverの使用を推奨する警告を出す。今回のHTTP応答は取得できた | 開発中の確認は `npm run dev`、Workersの確認は専用OpenNext構成を使用する。Cloudflare配置失敗とは扱わない |

C-01で不足したAPI設定は以下の9項目。`PUBLIC_API_ORIGIN` は今回ローカル試験用に指定した。

```text
MULTIBAAS_BASE_URL
MULTIBAAS_API_KEY
CHAIN_ID
REGISTRY_ADDRESS
REGISTRY_CONTRACT_LABEL
REGISTRY_CONTRACT_VERSION
REGISTRY_DEPLOYMENT_BLOCK
REGISTRY_ISSUER
CURVEGRID_PUBLIC_WEB3_RPC_URL
```

項目の用途は [起動手順](CURVEGRID_INTEGRATION_RUNBOOK.md) を参照。APIキー・秘密鍵・復号パスワードをチャットやPRへ貼らない。

## 設定後に行う試験

1. MultiBaasとRPCのchain ID、配置先のコード、ABI、発行者を照合し、接続確認APIのreadyを確認する。
2. 試験専用カードを発行し、未登録状態と許可ウォレットを確認する。
3. 本人ウォレットで登録し、取引hashと成功receipt、イベント、現在owner・名前を照合する。
4. 同じQRのカードを再読込・別端末から確認する。二重登録と許可外ウォレットの操作を拒否することを確かめる。
5. chain ID・contract・card ID・取引hash・block・確認日時・端末を保存し、成功した試験だけをOpenSpecで完了にする。

この確認時点で契約の配置・発行・登録・Worker公開は行っていない。OpenSpec 6.1〜6.4は未完了のまま。

## 出典

- [疎通試験と課題整理の依頼](../docs/prompts/2026-09-25/212734-547384-542a7b515a2144d98caa79fbd97635b9.json)
- [最新mainへのリベース指示](../docs/prompts/2026-09-25/212840-675778-f0efeecdb2e447d5bf28a11e0031b256.json)
