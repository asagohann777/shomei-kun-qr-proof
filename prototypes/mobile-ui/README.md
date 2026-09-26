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

アイコンはCodexが作成したSVG。背景・ロゴ・QRイラスト・カードはおじいちゃんコンビニから受領したJPEG。依存関係のライセンスは各パッケージに従う。プロジェクト全体の公開ライセンスは未確定。

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

ビルドとChromium・WebKitの既存フロー検証を通過。初期画面の最終調整後にも320px・390pxの画像読み込みと横はみ出しを確認した。背景・ロゴ等の組み込みは未デプロイ。

## 登録中の動きを確認する

ローカルの `http://localhost:4173/?scenario=registering` またはメニューの「登録中のアニメーション」でプレビューを開く。カードの浮遊、外周の光、立方体の発光、台座の光、下部リングの回転を繰り返す。プレビューは取引を作らず、完了画面へ自動遷移しない。通常の登録フローでは既存の模擬処理時間で完了する。

OSやブラウザで動きを減らす設定を有効にすると、これらのアニメーションは停止する。構図と登録状況は残る。カード素材は既存の `tradingCard()` を共有し、背景やカードの差し替え方法は上記と同じ。

ボタンの質感と登録中のアニメーションの追加は、現時点ではローカルのみ。公開版の更新は別途行う。

## スキャン画面の質感と動き

スキャン入口から進むと、半透明の状態表示と円形ボタン、風景・稲妻アイコン、発光する四隅、上下に往復する走査線を確認できる。動きを減らす設定では走査線を中央に止め、枠の明滅と読取り中リングの回転を停止する。写真・ライトの操作は従来どおり説明を開くモックで、端末機能は使用しない。この調整もローカルのみ。
