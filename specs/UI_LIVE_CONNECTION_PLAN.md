# 最新UIへのAPI・ウォレット接続

2026-09-26 JST。ユーザーが最新mainのUIへのAPI接続・署名実装と、環境変数によるモック維持を指示した。従来のUI担当分離を、この接続実装に限って更新する。元の作業場所は変更せず、既存PR #1の専用worktreeで進める。基準は最新origin/main `3598094`。ローカルmainは古い `3f1287e` のため、取得したorigin/mainを使う。

## 作業順と境界

1. 既存テンプレート・公開API・MetaMask公式APIを確認する。
2. モード、登録状態、APIとウォレットの境界を設計する。
3. 独立するAPI/登録処理とウォレット接続を分担し、共有テンプレートとビルドは最後に統合する。
4. モックの画面検証と実接続分岐のブラウザ試験を実施する。
5. 専用integration URLに同じUIを配置し、実測した範囲と実機で残る確認を記録する。

並行作業では書込み先を分ける。UIデザイン用のCSSと既存mockの操作フローを維持し、API・ウォレット処理を別モジュールにする。共有するpackage/lockfile・appテンプレート・配備設定は親担当が統合する。

## モード

| UI_API_MODE | UI_WALLET_MODE | 動作 |
| --- | --- | --- |
| mock（既定） | mock（既定） | 既存の画面シナリオ。外部通信・実ウォレット初期化なし |
| live | mock | 実カードの閲覧専用。登録送信・架空の成功表示なし |
| live | metamask | 実API、本人ウォレットによる登録取引の承認・送信 |
| mock | metamask | ビルド時エラー。架空の取引を本人へ署名させない |

ビルド時の公開設定はmode、API origin、UI公開URL、サンプルカードID、CSP用RPC originだけ。未設定のlive originや不正modeを拒否する。APIキー、秘密鍵、管理RPCは含めない。API通信の失敗をmockへ置換しない。UI検討の通常build/deployはmockのまま。別のintegration buildで既存API WorkerにUI静的アセットを同梱する。

## 操作と状態

カード固有URLは `?cardId=...`。QRは同じカードの確認URLを指す。未接続のまま公開カードを読む。カードIDがない入口ではスキャンボタンからカメラ画面の模擬へ進み、実接続ビルドではサンプルカードを実APIで読む。実カメラ撮影は今回も対象外。

登録では接続確認APIのchain・contractと、本人wallet・chainを照合する。ニックネームはUTF-8 1〜96バイト、trim・正規化しない。確認画面の同意後に準備APIを呼び、ABI・from/to/chain/value/cardId/nicknameを照合し、署名直前にwallet/chainを再取得する。

状態を未送信、準備中、承認待ち、hash取得済み、確認済み、拒否、revert、結果不明に分ける。hash取得前の通信失敗・ページ終了は結果不明として自動再送しない。hash取得後はorigin/chain/contract/card/hash/名前を保存し、再読込・復帰時に照会だけを再開する。アカウント・チェーン変更は確認と同意を無効にする。遅れて返った応答で別カードを上書きしない。

MetaMaskは廃止方向の旧SDKではなく、[MetaMask Connect EVM](https://docs.metamask.io/metamask-connect/evm/quickstart/javascript/)を使用する。スマホ外部ブラウザの接続・アプリ起動をSDKに委ねる。拡張/アプリ内providerも同じEIP-1193境界で扱う。個人署名による別ログインは不要で、登録取引の署名を求める。

## 検証

- モックbuildの外部通信・wallet初期化が0件。既存シナリオと日英表示を維持。
- live APIとmock walletでは閲覧だけでき、署名は起こらない。
- API異常、別chain/wallet、拒否、account/chain変更、連打、hash復元、結果不明、他カード切替を試験。
- API未署名取引の改変をブラウザ側で拒否。
- Chromium/WebKitの320px・390pxとdesktopで画像、横はみ出し、固定要素の重なり、console errorを確認。
- 公開integration UIで実カード情報を確認する。試験providerを使う自動試験を実スマホMetaMask成功と呼ばない。
- 実スマホでの署名には、発行者が許可した本人のテスト用アドレスとガス代が必要。秘密鍵は要求しない。

## 設計比較の結論

A案は既存テンプレートにlive専用controllerを接続、B案はmock/live双方のruntimeを抽出する案。並行デザインへの変更範囲、モック成功の混入防止、再開、モバイル対応、公開APIの小ささを比較し、独立レビューもA案を選択した。全面的なrenderer抽出は行わない。B案からAPIのmode照合、元の試行への遅延hash保存、カード単位のWeb Lock、CSPの接続先制限を採用する。

親担当は共通テンプレート・build・公開設定、独立した担当はlive controller/試験とMetaMask境界/試験を所有する。共有ファイルを同時編集しない。指定skillの既定モデルの一部はこの環境にないため、利用可能なモデルで設計候補と独立判定を行った。
