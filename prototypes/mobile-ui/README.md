# 証明くん スマホUIモック

チームで画面を相談するための静的モック。daisyUI 5とTailwind CSS 4を使用する。実カメラ・MetaMask・MultiBaas・Amoyには接続しない。

公開先: https://shomei-kun-ui-mock.dptr.workers.dev/

「QRコードをスキャン」で模擬カメラ画面に進み、「サンプルを読み取る」でカードを確認する。右上のメニューで言語、登録済み・未登録・エラーを選ぶ。`?scenario=unregistered` で登録を試せる。入力は同じタブ内のみ保持され、URLで他の端末へ共有されない。言語の選択はブラウザに保存する。

## ローカル起動

Node.js 22とPython 3を使用する。

```sh
cd prototypes/mobile-ui
npm ci
npm run dev
```

http://localhost:4173/ を開く。ソースを変更したら `npm run build` で再生成する。配信対象は `dist/` のみ。

## ブラウザ検証

ローカルサーバーを起動した状態で実行する。

```sh
npx playwright install --with-deps chromium webkit
npm run verify
```

スクリーンショットと結果JSONを `artifacts/` に出力する。配信アセットがローカルのビルド結果と一致することも確認する。公開先を検証する前に `npm run build` を実行する。WebKit撮影ツール自身の一時CSSに対するCSP警告は、アプリのエラーと分けて結果JSONに記録する。公開先を検証する場合は次を使う。

```sh
MOCK_BASE_URL=https://shomei-kun-ui-mock.dptr.workers.dev npm run verify
```

ブラウザエミュレーションによる検証であり、スマホ実機のSafari・MetaMask往復は別途必要。

## 公開

Cloudflare認証を設定して `npm run deploy` を実行する。専用Worker `shomei-kun-ui-mock` に静的アセットを配信する。実接続アプリのデプロイではない。別URLで公開する場合は `MOCK_PUBLIC_URL` にそのURLを指定してビルドし、カードのQRも更新する。

アイコンはCodexが作成したSVG。背景・ロゴ・QRイラスト・カードはおじいちゃんコンビニから受領したJPEG。依存関係のライセンスは各パッケージに従う。ソースコードは[MIT License](../../LICENSE)。提供画像・ロゴなどの素材はこのライセンス付与の対象外。

採用計画は [UI_MOCK_PLAN.md](../../specs/UI_MOCK_PLAN.md)、実測記録は [HACKATHON_CHANGES.md](../../specs/HACKATHON_CHANGES.md) を参照。

## 2026-09-26の図案ワイヤー

[UI_WIREFRAME_PLAN.md](../../specs/UI_WIREFRAME_PLAN.md)に図案との対応を記録した。ローカル版は中央カード、入力、登録確認、模擬承認、処理、完了の順に操作できる。2026-09-26に今回のワイヤーを上記の公開URLへデプロイした。

## 受領素材の組み込み

2026-09-26にローカルUIへ組み込んだ。原本と旧名の対応は[素材一覧](../../specs/assets/asagohann777/README.md)に保存。

| 表示 | 配布用素材 | 原本 |
| --- | --- | --- |
| 初期画面 | `public/assets/home-background.jpg` | `backgrounds/garden-mountains-02.jpg` |
| その他の画面 | `public/assets/flow-background.jpg` | `backgrounds/waterfront-platform-04.jpg` |
| 共通ロゴ | `public/assets/logo-ja.jpg` | `logos/shomeikun-qr-proof-ja.jpg` |
| 初期画面のQRイラスト | `public/assets/qr-scan.jpg` | `illustrations/qr-scan.jpg` |
| 共通カード | `public/assets/trading-card.jpg` | `cards/shomei-ichiro.jpg` |

JPEGは原本のままコピーした。ロゴの余白とカード周囲の市松模様はCSSの表示枠で隠している。日本語ロゴを両言語で使用し、代替テキストは切り替える。カード右下には既存のデモURLのQRを重ねる。初期画面のQRは受領イラストであり、操作は読み取りボタンから開始する。

ビルドとChromium・WebKitの既存フロー検証を通過。初期画面の最終調整後にも320px・390pxの画像読み込みと横はみ出しを確認した。背景・ロゴ等の組み込みを2026-09-26に公開URLへデプロイした。

## 登録中の動きを確認する

ローカルの `http://localhost:4173/?scenario=registering` またはメニューの「登録中のアニメーション」でプレビューを開く。カードの浮遊、外周の光、立方体の発光、台座の光、下部リングの回転を繰り返す。プレビューは取引を作らず、完了画面へ自動遷移しない。通常の登録フローでは既存の模擬処理時間で完了する。

OSやブラウザで動きを減らす設定を有効にすると、これらのアニメーションは停止する。構図と登録状況は残る。カード素材は既存の `tradingCard()` を共有し、背景やカードの差し替え方法は上記と同じ。

ボタンの質感と登録中のアニメーションも2026-09-26の公開版へ反映した。

## スキャン画面の質感と動き

スキャン入口から進むと、半透明の状態表示と円形ボタン、風景・稲妻アイコン、発光する四隅、上下に往復する走査線を確認できる。動きを減らす設定では走査線を中央に止め、枠の明滅と読取り中リングの回転を停止する。写真・ライトの操作は従来どおり説明を開くモックで、端末機能は使用しない。この調整も2026-09-26の公開版へ反映した。

## API・ウォレットの切替

通常の `npm run build` / `npm run dev` はAPI・ウォレットともモック。UIデザインの作業には追加設定は不要。

| 環境変数 | 既定値 | 実接続 |
| --- | --- | --- |
| `UI_API_MODE` | `mock` | `live` |
| `UI_WALLET_MODE` | `mock` | `metamask` |
| `UI_API_BASE_URL` | なし | 公開APIのorigin |
| `UI_PUBLIC_URL` | UIモックURL | カードの共有・QR用URL |
| `UI_SAMPLE_CARD_ID` | `connectivity-20260926-001` | 模擬スキャンで開くカードID |
| `UI_RPC_ORIGIN` | なし | 実ウォレット用RPCのorigin。CSPの許可先 |

値はビルド時に決まる。`.env.example` は設定例で、UI側の `.env` は自動では読み込まない。シェルの環境変数として指定する。

```sh
UI_API_MODE=live UI_WALLET_MODE=mock \
UI_API_BASE_URL=https://shomei-kun-integration.dptr.workers.dev \
UI_PUBLIC_URL=https://shomei-kun-integration.dptr.workers.dev/ui/ \
npm run build:integration
```

`live/mock` は閲覧専用。`mock/metamask` はビルドエラー。実接続ではシナリオ切替・模擬承認を表示しない。カメラ画面への遷移は従来どおり模擬。

UIソースはこのディレクトリを共有する。専用Workerのビルドは `apps/web/scripts/prepare-integration-ui.mjs` が同じソースを `dist-integration` へビルドし、生成物をAPIアプリの `public/ui` に同梱する。管理キーをUIへ渡さない。[手順と実測](../../specs/UI_LIVE_CONNECTION_REPORT.md)を参照。

```sh
npm test
# port 4174にlive/metamask、4175にlive/mockを配信して実行
LIVE_READONLY_UI_URL=http://127.0.0.1:4175 node scripts/verify-live-ui.mjs
```

`verify-live-ui.mjs` はAPI応答とEIP-1193を差し替えるブラウザ試験。`verify-live-chain.mjs` は明示した専用鍵で実取引を送る手動実行用スクリプト。通常のテストには含めない。後者もスマホ実機のMetaMask試験とは区別する。

実ウォレットを注入せずに配信bundleのSDK初期化を確認するには `node scripts/verify-metamask-sdk.mjs` を実行する。専用URLでMetaMaskの起動リンクとrelay接続開始を確認し、アプリへの移動直前で止める。取引は送信しない。

## 承認・登録確認の追加図案

2026-09-26受領の図案に合わせ、登録確認の項目アイコン・同意文・カードサイズと、ウォレット承認の情報パネル・拒否ボタンを調整した。`?scenario=unregistered` から「次へ」、サンプル接続、「次へ」で確認できる。同意チェック後の「登録する」で承認画面に進む。実接続では承認をMetaMask内で行う。日英・320px/390px・Chromium/WebKitで確認済み。この追加修正は2026-09-26に公開UIモックへ反映済み。

## カメラの切替

既定の `UI_CAMERA_MODE=mock` は現在のサンプル読取りを維持し、カメラ権限を要求しない。実カメラと写真内のQR読取りは次のようにビルド時の環境変数で有効にする。

```sh
UI_CAMERA_MODE=live npm run dev
```

`.env.example` は設定項目の例で、自動読込みはしない。`UI_API_MODE`・`UI_WALLET_MODE` は独立設定。カメラだけliveなら、読み取ったIDの模擬未登録カードを表示する。実APIも使う場合は既存の実接続設定を併用する。設定を変えたら再ビルドする。

カメラはHTTPSまたはlocalhostで使用する。スマートフォンからLANのHTTPアドレスを開いても起動できない場合がある。カメラを許可できない場合は「写真から」を使う。画像はアップロードしない。ライトは対応端末のみ表示し、タブを隠した後は「再開」で起動する。

受け付けるQRは `UI_PUBLIC_URL` の `?cardId=...` と、設定済みAPIの `/api/v1/cards/{id}`。公開URLにパスがある場合も一致が必要。APIモック時のみ従来の `?scenario=registered` も利用できる。詳細は [カメラ仕様](../../specs/CAMERA_SCAN.md)。

```sh
npm test
# Chromium / WebKit と ffmpeg が必要
npm run verify:camera
```

ブラウザ検証では実QR画像・仮想カメラ映像を使う。iPhone/Androidの実カメラとライトは実機で別途確認する。
## MetaMaskの接続準備

iPhone・iPadの外部ブラウザでは「MetaMaskで開く」から同じカードをアプリ内ブラウザで開く。開かなければカードURLをコピーして貼り付ける。MetaMask内では「MetaMaskで準備する」から接続・ネットワーク追加・切替へ進む。ほかの外部ブラウザではSDKを使い、復帰後に接続状況を確認する。[デモ手順](../../specs/DEMO.md)。

通常のmock/mockで `?scenario=wallet-connect`、`wallet-add`、`wallet-switch`、`wallet-paused`、`wallet-rejected`、`wallet-ready` を確認できる。準備処理は実行しない。live/mockは閲覧専用のまま。

`node scripts/verify-wallet-preparation.mjs` は4273のmock、4274のlive UIを合成ウォレット/APIで操作する。URLは `MOCK_BASE_URL` と `LIVE_UI_URL` で変更できる。アプリ移動を模擬した試験であり、iPhone実機のMetaMask往復を検証したものではない。詳しくは [接続準備計画](../../specs/METAMASK_PREPARATION_PLAN.md)。

## ENS search

Live mode adds an optional `Find cards by ENS name` action below QR scanning. It resolves Sepolia names and searches cards registered to that wallet on Curvegrid Testnet. See [ENS integration](../../specs/ENS_INTEGRATION.md) for API setup, pagination, error behavior and browser checks.

Mock mode also exposes the ENS search UI. Open `/?preview=ens` directly or use the secondary action on the home screen. `shomeikun.eth` returns sample cards with pagination, `empty.eth` returns no cards, and `error.eth` shows an upstream error. Other valid names show the unresolved-name state. All results are fixtures; no API, ENS or wallet requests are made. Selecting a sample card opens the existing registered-card view.
