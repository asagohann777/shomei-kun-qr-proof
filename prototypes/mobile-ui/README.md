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
