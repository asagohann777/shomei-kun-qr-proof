# 最新UIと実APIの接続結果

2026-09-26 JST。PR #1の専用worktreeで、`origin/main` の `3598094` を基準に実装した。終了前にも同じSHAを確認した。既存UIモックのWorkerは更新していない。大会期間との対応は未確認。

## 公開先と操作

- [入口](https://shomei-kun-integration.dptr.workers.dev/ui/)
- [未登録の手動用カード](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=mobile-ui-20260926-manual)
- [自動試験用カード](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=mobile-ui-20260926-001)

カード固有URLから所有者を未接続で確認できる。未登録カードでは名前、MetaMask接続、公開内容の確認、登録取引の承認へ進む。最初の入口はスキャンボタンからカメラ画面の模擬へ進み、試験カードを開く。実カメラ撮影は対象外。

発行者の許可先と接続アドレスが一致した場合だけ登録できる。実登録の確認はAPIで行い、画面タイマーで成功にしない。取引ハッシュはカード・チェーン・記録先・API originと合わせて保存する。復帰・再読込では照会だけを再開する。ハッシュ取得前に応答が不明になった場合は、自動再送せずMetaMaskの履歴からハッシュを確認する。

## 試験ウォレット

ユーザーの指示で専用ウォレットを新規作成した。[公開情報](assets/curvegrid-connectivity/mobile-ui-wallet.json)にアドレスと公開鍵を保存した。

アドレス `0x208Fa3cd72959b2562c898B3b7Fc75C0C6fcA99E`。Curvegrid Testnet、chain ID `2017072401`。発行者ウォレットから試験通貨0.05 ETHを補充した。

秘密鍵は `/tmp/shomei-kun-curvegrid-integration/contracts/.issuer-state/mobile-ui/wallet.keystore.json` に暗号化して保存。パスワードは同じディレクトリの `password`。ディレクトリ0700・ファイル0600で、どちらもGit管理外。Worker・ブラウザ・提出資料には含めない。実機で同じアドレスを操作するには、ユーザー側のMetaMaskにこの試験アカウントを取り込む必要がある。公開アドレスだけでは署名できない。

| カード | 用途 | 発行取引 |
| --- | --- | --- |
| `mobile-ui-20260926-001` | ブラウザからの実取引試験 | `0xd435fd7751f81da80bb26e29f208d2759afab5e5d679b407405773ed5c019c20` |
| `mobile-ui-20260926-manual` | スマホ手動試験。未登録を維持 | `0xa53a0d295af58b86879e1d1f0a04298233cbfdabaab33d20242ae5c12e8cd85e` |

## 再現手順

```sh
cd prototypes/mobile-ui
npm ci
npm run build
npm test
# 別ターミナルで npm run dev を起動
npm run verify

cd ../../apps/web
npm ci
BACKEND_MODE=live npm run build:integration
npx wrangler deploy --config wrangler.integration.jsonc
```

デプロイ先は専用integration Worker。必要設定は既存の [起動手順](CURVEGRID_INTEGRATION_RUNBOOK.md) を参照。UIビルドはAPIモードlive・MetaMask接続を既定にし、`UI_WALLET_MODE=mock` で閲覧専用にできる。APIアプリの `.env.local` からはビルドに必要な公開設定だけを抽出する。`runtime-env-only.mjs` がOpenNextの環境値埋込みを消去し、成果物内の既知の認証情報を検査する。

通常のUIデザイン用ビルドは引き続きmock/mock。環境変数の一覧は [UI README](../prototypes/mobile-ui/README.md#apiウォレットの切替) を参照。

## 検証した範囲

- UI境界43件、API66件と型検査に成功。APIレスポンスはOpenAPI由来のvalidatorで検証する。
- モックの既存シナリオをChromium/WebKitで検証。外部通信、console errorは0件。
- 実接続分岐を両ブラウザのfixture試験で検証。承認、pending、API confirmed、再読込、二重送信防止、API障害、閲覧専用モードを確認。
- 320px・390px・1365pxの画像を確認。横はみ出し、固定要素の重なり、壊れた画像、console errorなし。
- 公開WorkerのルートはカードIDを保って `/ui/` に遷移。UI・JSは200。CSPは同一origin、指定API/RPC origin、MetaMask relayだけを通信先として許可。
- 秘匿情報検査を含む専用Workerビルドが成功。初回公開version `841d26fa-2222-4c0c-854d-7d017a096cc7`。SDK修正後のversion `b380129d-60af-4240-a326-f52287daec89`。

ブラウザfixture試験と、ローカルの試験鍵で署名する実チェーン試験を分ける。どちらも実スマホでMetaMaskアプリを往復した証明にはしない。

## 公開UIからの実登録

試験カード `mobile-ui-20260926-001` を「おじいちゃんコンビニ」で登録した。取引 `0x6e28d940225fb8a5ef0efc2020484d08275d87b33fbd8befa71253ccb077b9ee`、block `18772`。ウォレット送信は1回。APIがconfirmedを返した後、再読込みと未接続の別ブラウザコンテキストでも同じ所有者を確認した。

[実測JSON](assets/ui-live-2026-09-26/chain-results.json)、[390pxの完了画面](assets/ui-live-2026-09-26/390-confirmed.png)、[320pxの第三者英語表示](assets/ui-live-2026-09-26/320-public-en.png)、[fixtureブラウザ試験](assets/ui-live-2026-09-26/browser-results.json)を保存した。秘密鍵はNodeプロセス内だけで扱い、EIP-1193を試験providerへ差し替えた。

## SDKのブラウザ組込み修正

実ウォレットを注入しないブラウザ試験で、MetaMask SDKの動的importがCommonJSのdefault exportだけを返し、SessionStoreとPrivateKeyの初期化に失敗した。coreとdapp-clientは同梱ESMへ解決し、CommonJSのみのeciesjsは小さいESM境界で必要なexportを明示した。依存バージョンを固定し、`scripts/verify-metamask-sdk.mjs` で実際の配信bundleを検証する。

この試験はiPhone相当のブラウザで、未接続状態からSDKを読み込み、MetaMaskのアプリ起動リンクとrelay接続開始を確認する。アプリへの移動は直前で止め、取引の準備・送信はしない。実スマホの復帰試験とは別の確認である。修正後の公開URLでChromium・WebKitとも成功し、エラーと取引準備要求は0件。[SDK実測JSON](assets/ui-live-2026-09-26/sdk-results.json)を保存した。

## 残る確認

1. スマホ実機の外部ブラウザからMetaMaskへ移動し、接続・承認・拒否・ブラウザ復帰・切断・再照会を試す。SDKはHTTPS universal linkとrelayを使う。実OSの復帰動作は未確認。
2. 別の物理端末で同じQRを開き、所有者と取引を確認する。別ブラウザコンテキストの試験とは区別する。
3. MetaMask Connect EVM 2.1.1の依存関係にnpm auditのmoderate 6件が残る。原因は推移的依存uuidのv3/v5/v6バッファ境界検証で、直接の使用箇所はSDK内のNode用ファイル処理が呼ぶv4である。互換性未確認の強制overrideは行っていない。更新時にSDK対応版と監査を再確認する。

実機確認が残るためOpenSpec 6.2/6.3とA07全体は完了扱いにしない。

実チェーン試験を繰り返す場合は、CLIで同じ試験ウォレットを許可した新しいカードを発行する。登録済みカードや同じ送信stateでは新しい送信をしない。

```sh
cd prototypes/mobile-ui
LIVE_TEST_CARD_ID=新しく発行したID \
LIVE_TEST_KEYSTORE=../../contracts/.issuer-state/mobile-ui/wallet.keystore.json \
LIVE_TEST_PASSWORD_FILE=../../contracts/.issuer-state/mobile-ui/password \
LIVE_TEST_TRANSACTION_FILE=../../contracts/.issuer-state/mobile-ui/新しい試験名.json \
node scripts/verify-live-chain.mjs
```

この環境のWebKit検証では不足するOSライブラリを `/tmp/shomei-webkit-deps` に展開し、既存の `/tmp/shomei-browser-runtime` ランチャーを使った。実行環境に必要なライブラリがある場合は標準のPlaywrightでよい。`PLAYWRIGHT_BROWSERS_PATH=/tmp/shomei-browser-runtime PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` はこの検証環境での指定であり、アプリの要件ではない。
