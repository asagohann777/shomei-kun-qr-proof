# Curvegrid疎通試験と課題

2026-09-26 JST。対象はPR #1の `bcfcede`。初回は設定不足で停止した。その後、ユーザーが設定した認証情報でMultiBaasの状態・ブロック・Libraryを実際に読み取り、今回のABI登録に成功した。その後、Testnetへの配置・発行・登録とローカルAPIの証跡読取りに成功した。専用Workerでも接続・所有者・登録取引・再読込み・二重登録拒否を確認した。ローカルAPI起動、管理REST疎通、チェーン書込みを区別する。

## 最新mainの取込み

ユーザーの指示で `git pull --rebase origin main` を実行した。取得できた `origin/main` は `cdb1ffe`。対象ブランチは取り込み済みで、追加リベース・競合・履歴変更はなかった。

## 初回に実行した確認

| 確認 | 実測結果 |
| --- | --- |
| 接続設定の有無 | 専用worktree・元の作業場所のルート、apps/web、contractsの `.env*` / `.dev.vars*` とシェル変数を確認。MultiBaas関連設定なし。値は出力していない |
| live API起動 | `BACKEND_MODE=live PUBLIC_API_ORIGIN=http://127.0.0.1:3108 npm run start -- --hostname 127.0.0.1 --port 3108` で起動 |
| `GET /api/v1/connection` | 503、`meta.mode=live`、`CONFIGURATION_MISSING`、`Cache-Control: no-store` |
| `GET /api/v1/cards/connectivity-check` | 同じ503。未発行・未登録の判定やカード発行はしていない |
| 登録準備へのOPTIONS | 204。同一Originを許可し、GET/POSTとContent-Typeのpreflightに応答 |
| Cloudflare専用Worker | 外部ネットワーク権限で `wrangler deployments list --config wrangler.integration.jsonc` を実行。`shomei-kun-integration` は未存在、Cloudflare code 10007 |

Cloudflareの結果は専用Workerの不存在であり、認証情報の不正やMultiBaasの障害とは判断しない。APIは固定mockへ切り替わらず、設定不足で停止した。既存UI用Workerは変更していない。

## 課題と対応（初回）

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

初回確認時点では配置・発行・登録・Worker公開は未実施だった。更新後の結果は以下を参照。

## 出典

- [疎通試験と課題整理の依頼](../docs/prompts/2026-09-25/212734-547384-542a7b515a2144d98caa79fbd97635b9.json)
- [最新mainへのリベース指示](../docs/prompts/2026-09-25/212840-675778-f0efeecdb2e447d5bf28a11e0031b256.json)

## 設定提供後の実測と修正

ユーザーが `.env.local` を用意した。設定名が `MULTIBASS_API_KEY` / `MULTIBASS_ENDPOINT_URL` だったため、秘密値を表示せず `MULTIBAAS_API_KEY` / `MULTIBAAS_BASE_URL` に揃えた。ファイル権限は0600、Git管理外を維持した。取得したチェーンIDと、登録したLibraryラベル・バージョンも同じファイルに保存した。

| 操作 | 実測結果 |
| --- | --- |
| チェーン状態GET | HTTP 200。chain ID / network IDは `2017072401`、ブロック `18763` |
| 最新ブロックGET | HTTP 200。numberは10進文字列、hashは0x形式。Gatewayの期待形式に一致 |
| 既存Library・リンク一覧GET | HTTP 200。今回のRegistryはなく、アドレスリンクは0件。既存Libraryは変更していない |
| 今回のLibrary登録POST | 初回400 `unable to parse JSON`。binの0x接頭辞を保持すると200 |
| Libraryの再利用 | `shomeikuncardregistry` / `1.0.0` のABI・bytecodeがローカル成果物と一致。再登録なしでCLI成功 |

機密情報と既存プロジェクト情報を除いた [実測JSON](assets/curvegrid-connectivity/multibaas-readonly.json) を保存した。公開API全体のreadyや実ウォレットの登録成功を意味しない。

### C-07: ABI登録のbytecode形式（修正済み）

CLIは `bin` にbytecode先頭の `0x` を除いて送っていた。実MultiBaasはHTTP 400を返した。同じABI・ラベル・バージョンで接頭辞だけを保持すると200になったため、`contracts/cli/multibaas.ts` を修正した。POST内容に0x付きbytecodeが含まれる回帰試験を追加した。合成応答の従来試験では登録リクエストのこの条件を検証していなかった。

### 残る設定と実環境試験

- 専用公開Web3 RPC URLの追加後、eth_chainIdが `2017072401` であることを実測した。管理RESTキーをRPCへ流用していない。
- ユーザーの選択で試験専用の発行者・登録者ウォレットを新規作成した。暗号化キーストアはGit管理外に0600で保存。Faucetから両ウォレットへ1 ETHずつ入金されたことを実測した。
- コントラクト配置後、address・issuer・deployment blockを設定した。
- 管理用キーとは別にDAppグループのアプリ用キーを作成した。状態・Library読取り200、管理用groups読取り403を確認。Workerに管理用キーを設定しない。
- 専用Workerは公開済み。接続設定と公開先の実接続は確認済み。スマホ署名・復帰、別端末確認は未完了。

C-01・C-03は解消。C-04は実応答fixtureと回帰試験を追加した。C-02の公開先設定も完了し、C-05のスマホUI結合が残る。

修正後、CLIの型検証とコントラクト・CLI試験16件に成功した。Faucet対象の試験用公開アドレスは以下。秘密鍵・復号パスワードは記録しない。

- 発行者: `0x742685dF0832515184334FaA2d28931AD2605100`
- 登録者: `0xf12904Ef7aBfD79b68dcCdc7b30cFDE2D6BEeeb8`

## 実チェーンでの配置・登録結果

| 項目 | 実測値 |
| --- | --- |
| Chain ID | 2017072401 |
| Contract | `0xE226ABd4e3866568C7bd53a57f2CA4b619EFB47e` |
| 配置取引 / block | `0xc8bce4cd994f9cb2520ef42e2b8aaae3e88173b26199841f23acbf9e81f994e1` / 18766 |
| カードID | `connectivity-20260926-001` |
| 発行取引 / block | `0xda58f704b15a05798b61b0a5b045b5906eb5ce9d9281fe35bd08a4fc0c5afec4` / 18767 |
| 登録取引 / block | `0x83f7601a0eae1123029e0f407ecd5e72ebd4d9b34e5181363bf8cabab6a9cb12` / 18768 |
| 名前 | おじいちゃんコンビニ |
| API接続 | 200 ready。chain・code・ABI・issuerを照合 |
| 未登録カード | 200 unregistered |
| 許可外ウォレットの登録準備 | 422 WALLET_NOT_ALLOWED |
| 本人の登録準備 | 200。from/to/chain/value/calldata照合後、本人の試験鍵で署名 |
| 登録確認 | 200 confirmed。取引・receipt・イベント・現在owner一致 |
| 公開カードの再照会 | 200 registered、evidence available。再読取りでも一致 |

配置・発行はCLIのexecute/resumeを使用。登録は専用試験鍵を使うスクリプトで署名し、送信前に署名済み取引をGit管理外へ保存した。スマホやMetaMaskの操作成功を意味しない。二重発行・二重登録は実配置先へのeth_callでCALL_EXCEPTIONとなった。取引を追加送信した試験ではなく、RPCからrevert理由を取得できなかったため具体的なエラー名までは断定しない。

[実API応答fixture](assets/curvegrid-connectivity/api-responses.json) と [ローカルHTTP検証](assets/curvegrid-connectivity/local-api-verification.json) を保存。fixtureでRPCのchain/code応答のみ合成し、MultiBaasのカード・イベント・取引・receipt・blockは実測値で回帰検証する。

### C-08: 開発サーバーのバンドラー差異（修正済み）

デフォルトのTurbopackで共通ABIが参照範囲外になり、範囲を広げても生成validatorのCJS importで `func1 is not a function` が発生した。`npm run dev` を既存buildと同じWebpackへ統一し、カードGETと登録準備POSTが200になることを実測した。

### C-09: イベント一覧の取得件数（修正済み）

`GET /events` のlimit=100は400 `invalid request`、limit=10は200だった。contract_addressとevent_signatureはそのままで、10件ずつ最大10ページに変更した。上限到達は503を維持し、証跡なしと断定しない。100件を超える登録の探索にはEvent Queryなど別方式の検討が必要。ページ幅・offsetの回帰試験と実応答fixtureの所有者・取引確認試験を追加した。クエリ項目は [Curvegrid公式API資料](https://docs.curvegrid.com/multibaas/api/get-event-count/) と照合し、許容件数は実環境で確認した。

### C-10: OpenNextによるローカル環境値の取込み（修正済み）

OpenNext 1.20.6が `.env.local` の値を `.open-next/cloudflare/next-env.mjs` に含めることをビルド検査で検出した。配置処理を中断し、ビルド後に全モードの埋込み環境値を除去する `runtime-env-only.mjs` を追加。成果物内に元のキー・RPC値が残っていないことを検査してから再配置した。中断直後のdeployment一覧は空だった。管理用キー・秘密鍵は実行時設定の対象外。

### C-11: 公開WorkerのSecret保存（許可後に完了）

専用URLは https://shomei-kun-integration.dptr.workers.dev 。初回配置versionは `8f5afe00-4234-436f-85ab-4382afc5fec1`。設定前の接続確認は503 CONFIGURATION_MISSINGだった。アプリ用APIキーと接続設定をCloudflare Secretへ保存する操作は、自動承認レビューが「この外部保存先への認証情報送信に明示的な許可が必要」として拒否した。ユーザーが「保存して疎通試験を進める」と明示的に許可した後、11項目のSecretを保存した。元のUI Workerは変更していない。

## 再現と残る確認

`apps/web` で次を実行する。RPC URLは結果から除去する。

```sh
node scripts/verify-live.mjs http://127.0.0.1:3108 connectivity-20260926-001 0x83f7601a0eae1123029e0f407ecd5e72ebd4d9b34e5181363bf8cabab6a9cb12
```

公開先の設定後は第1引数を専用Workerのoriginへ変更する。スマホMetaMaskの承認・拒否・切断・復帰、別端末のQR読取り、UI表示は未検証。C10のブラウザ条件とC11/C12、A07全体を完了とはしない。

API試験66件とコントラクト・CLI試験16件、型検証、OpenNextビルドに成功。AIが疎通操作、問題切分け、実装修正、fixture・試験・文書を作成。人間が接続情報、公開RPC、試験鍵作成の方針とFaucet入金を提供した。大会期間との対応は未確認。

### C-12: Workersのfetch redirect指定（修正・公開先で成功）

公開Workerだけで接続確認が503になった。秘密値を伏せた診断ログで、ランタイムが `redirect: "error"` をTypeErrorとして拒否していると確認した。`manual` に変え、3xxを通常の上流HTTPエラーとして拒否する。別URLへの再送はしない。302応答で処理が失敗し、呼出しが1回で止まる回帰試験を追加した。呼出しコンテキスト変更では解消しなかったため、その仮修正は残していない。エラー本文を記録する一時診断も除去し、サービス種別・HTTP status・例外名だけを記録する。

## 公開Workerでの最終確認

最終配置versionは `04cbc950-4328-4f57-98c6-ba26e110f708`。`verify-live.mjs` を専用URLへ実行し、接続200 ready、カードGET 200 registeredを2回、取引GET 200 confirmed、二重登録準備409 ALREADY_REGISTEREDを確認した。[公開HTTP実測](assets/curvegrid-connectivity/worker-api-verification.json) に日時・応答を保存した。公開RPC URLは除去済み。

[CORS実測](assets/curvegrid-connectivity/worker-cors.json) ではUI OriginのOPTIONSが204、未許可Originは403。管理キーを保存せず、承認済みのアプリ用接続設定11項目をSecretへ保存した。Secret保存の承認待ちは解消した。

試験環境はLinux上のNode.js 22によるHTTPクライアントと試験専用鍵。スマホMetaMask・別端末QRのUI結合は残るため、OpenSpec 6.2の全条件と6.3は未完了。6.1・6.4は完了。
