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

カードとアイコンはCodexが新規作成したSVG。依存関係のライセンスは各パッケージに従う。プロジェクト全体の公開ライセンスは未確定。

採用計画は [UI_MOCK_PLAN.md](../../specs/UI_MOCK_PLAN.md)、実測記録は [HACKATHON_CHANGES.md](../../specs/HACKATHON_CHANGES.md) を参照。

## 2026-09-26の図案ワイヤー

[UI_WIREFRAME_PLAN.md](../../specs/UI_WIREFRAME_PLAN.md)に図案との対応を記録した。ローカル版は中央カード、入力、登録確認、模擬承認、処理、完了の順に操作できる。2026-09-26に今回のワイヤーを上記の公開URLへデプロイした。

素材は次の箇所で差し替える。既存の図案JPEGは制作記録として保存し、画面の背景としてそのまま貼り付けていない。

| 素材 | 差し替え箇所 | 目安 |
| --- | --- | --- |
| カード | `public/player.svg` または `public/app.js` の `tradingCard()` 内の画像パス | 縦横比5:7。カード単体、背景なし。画面の見出し・ボタンは含めない |
| 共通背景 | `public/` に画像を置き、`styles/input.css` の `.phone` の `--scene-image` を `url('./background.webp')` に変更 | 縦長9:16。中央にカードとフォームを重ねるため、文字なし |
| ロゴ | `public/app.js` の `.brand` 内 | 現在は日英テキスト。画像化する場合もホームへのリンク名を維持 |

現在のカードは仮SVG、背景は空色の無地。QRは別のSVGを重ねているため、受領するカード素材にはQRを埋め込まない。QR付き素材を使う場合は `tradingCard()` の重ねるQRを調整する。素材差し替え後はビルドと日英・各幅での再確認が必要。

## 登録中の動きを確認する

ローカルの `http://localhost:4173/?scenario=registering` またはメニューの「登録中のアニメーション」でプレビューを開く。カードの浮遊、外周の光、立方体の発光、台座の光、下部リングの回転を繰り返す。プレビューは取引を作らず、完了画面へ自動遷移しない。通常の登録フローでは既存の模擬処理時間で完了する。

OSやブラウザで動きを減らす設定を有効にすると、これらのアニメーションは停止する。構図と登録状況は残る。カード素材は既存の `tradingCard()` を共有し、背景やカードの差し替え方法は上記と同じ。

ボタンの質感と登録中のアニメーションの追加は、現時点ではローカルのみ。公開版の更新は別途行う。

## スキャン画面の質感と動き

スキャン入口から進むと、半透明の状態表示と円形ボタン、風景・稲妻アイコン、発光する四隅、上下に往復する走査線を確認できる。動きを減らす設定では走査線を中央に止め、枠の明滅と読取り中リングの回転を停止する。写真・ライトの操作は従来どおり説明を開くモックで、端末機能は使用しない。この調整もローカルのみ。

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
