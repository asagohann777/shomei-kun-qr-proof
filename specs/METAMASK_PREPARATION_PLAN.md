# MetaMaskの接続準備とアプリ間の復帰

2026-09-26。ユーザー承認済みの計画。作業ブランチは `feat/test-card-batch`。最新main `5f93c2e` を取り込み、専用integration環境に反映する。UIモックWorkerは変更しない。

## 体験

登録画面の「MetaMaskで準備する」から接続・ネットワーク追加・切替を進める。MetaMaskに移る前に「許可したら、この画面に戻ってください」と案内する。戻ったときは接続状態を再確認し、次の承認が必要なら「MetaMaskで続ける」を表示する。自動で別アプリを繰り返し開かない。

接続前からCurvegrid Testnetを表示する。接続待ち・追加待ち・切替待ち・完了をウォレット欄だけに表示する。別ネットワークは通常の準備として扱い、接続の拒否や通信失敗を登録失敗画面にしない。「うまく進まないとき」には同じカードをMetaMask内ブラウザで開く導線と手動設定のコピーを置く。

既存カード、背景、白 #ffffff、淡青 #eaf4ff、本文 #080e48、操作 #0068f5、完了 #24734d、境界 #dce4ed を維持する。左揃え、既存システムフォント、本文14px・ボタン16px・タップ領域44px以上。別の準備画面を増やす案より、入力とカードを保持したウォレット欄での案内を採用する。日英を揃える。

## 実装

- Safari/ChromeはSDK既定の接続で許可を取得し、未追加の対象チェーンを初回接続に指定しない。MetaMask内ブラウザは注入providerを使う。
- 接続後にチェーンを確認し、必要なら切替。4902のときだけ追加し、再確認して必要なら切替。code、rpcCode、入れ子エラーを正規化する。
- 準備を登録状態から分離。visibilitychange/pageshowで照合し、非表示中は次の要求を開始しない。60秒の目安は前面の時間のみ。時間超過は取消しではなく応答確認待ちとし、保留要求を重ねない。
- 再読み込みはSDKのセッションを復元して確認する。保存した段階だけで接続済みにしない。同じブラウザ内のカードとニックネームを保持する。
- 段階、要求ID、復帰、エラーを診断ログに記録する。秘密情報やRPC URLをログに含めない。
- /api/v1/connectionを流用し公開API/コントラクトは変更しない。準備では登録取引を送らない。モックと閲覧専用モードを維持する。

## 受け入れと公開

未追加、別チェーン、準備済み、拒否、保留、通信切断、遅延応答、アカウント変更、1分以上のアプリ移動、承認せず復帰、途中の再読込みを検証する。重複要求と誤った完了を防ぐ。日英の320/390/デスクトップをChromium/WebKitで描画して画像・はみ出し・コンソールを確認する。実機結果は自動試験と分ける。実機で確認するまでiPhone対応を検証済みとはしない。

iOSのバックグラウンド停止によりMetaMask内で承認が連続すること、ブラウザへの自動復帰は保証しない。カードの再発行はしない。

## 作業中の追加指示

テストカードの具体的なURL・発行記録・画像を公開Git履歴から除去する。再発行しない。記録はローカルの非公開控えへ退避し、未マージのPRブランチを履歴修正した。以後のビルドには公開一覧を含めない。個別カードのチェーン記録と既存URLは維持する。

## 履歴修正の結果と制約

未マージのPRブランチからカード記録12ファイルを履歴ごと除去し、PR説明も更新した。mainには混入していなかった。公開ブランチとPRの現行merge/head参照から記録への到達がないことを確認した。ローカルに控えを保持し、今後の非公開カード控え用ディレクトリはGit管理対象から除外した。

GitHub APIでは旧コミットをSHA指定で取得できた。GitHub内部の旧参照・キャッシュはforce pushだけでは完全削除できない。[GitHubの削除手順](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)はSupport対応の範囲を機密情報に限定している。通常の履歴除去と完全消去を区別する。カードのチェーン記録は変更していない。

## 検証結果

- UI単体66件成功。接続・未追加・追加時の自動切替・各段階の拒否・外部の保留要求・前面60秒・非表示中の長時間待機・遅延応答・重複操作・再読込み・破棄後の応答を含む。
- Chromium 149 / WebKit 26.5で既存モック全フローと実接続分岐の合成試験に成功。登録済みカードの復帰で準備を起動しないこと、証跡再取得でカードDOMを置換しないこと、503表示を確認。
- 同ブラウザで準備の接続/追加/切替ごとにアプリ移動を模擬し、戻った後に次の承認を明示操作で進めること、同じブラウザでの下書き復元、接続拒否後もフォームを残すことを確認。日英の320/390/1365pxで描画し、画像と横はみ出し・固定フッターの重なり・コンソールを確認した。
- 実MetaMask SDKの動的読込み、relay接続開始、アプリ起動リンクを確認。アプリへの移動は直前で抑止し、登録APIへの要求は0件。ローカル検証では公開APIのGETのみNodeから中継してCORSを分離した。
- 専用Workerビルド、型検査、環境値の除去と既知の認証情報混入検査が成功。Workerのlive設定不足/CORS/モック拒否の4件成功。

[準備ブラウザ試験](assets/metamask-preparation/browser-results.json)、[登録回帰試験](assets/metamask-preparation/registration-results.json)、[SDK起動試験](assets/metamask-preparation/sdk-results.json)、[日本語390px](assets/metamask-preparation/390-preparation-ja.png)、[英語320px](assets/metamask-preparation/320-preparation-en.png)、[追加待ち](assets/metamask-preparation/390-add-network.png)、[準備完了](assets/metamask-preparation/390-ready.png)。画像内のカード・ウォレットは合成試験用。

実機のiPhone Safari/Chrome/MetaMaskで未追加から往復する確認は未実施。自動試験を実機検証の代わりにはしない。

## 専用integration公開

2026-09-26、最終Worker version `e2f4e9fe-84aa-4ce5-9a10-78c9e30b9ca5` を専用integrationへ配置した。UIモックWorkerは変更していない。[公開資産確認](assets/metamask-preparation/public-assets.json)ではJS/CSS/HTML 22ファイルがビルドと一致し、接続APIはready、旧公開一覧2ファイルは404。個別カードのURLとチェーン記録は維持した。

公開URLで実SDK起動を両ブラウザで再確認し、登録API要求0件・エラー0件。[公開SDK結果](assets/metamask-preparation/public-sdk-results.json)。

### 公開後の追加修正

CSP付きのアプリ復帰試験で、ウォレット状態更新時のカード再描画からQR画像のCSP警告が発生した。撮影由来という仮説は、撮影なしの同じ操作でも再現したため棄却した。ブラウザの開始元スタックでrenderへの経路を特定し、登録フォームのカード・入力欄を保持してウォレット欄だけを更新するよう修正した。CSPを緩和せず、両ブラウザで同じ操作の警告が消え、カード・入力欄のDOM同一性を保つことを確認した。[CSP付き試験](assets/metamask-preparation/csp-browser-results.json)。WebKitのスクリーンショット処理による一時的なstylesheet CSP警告は別記録で、アプリのエラーは0件。

復帰照合の遅延した成功・失敗が、新しく完了した接続を上書きしないことをウォレット境界と準備状態の両方で試験した。

公開URLの準備操作・復帰・再読込みも両ブラウザで成功し、QRのCSPエラーは0件。[公開ブラウザ結果](assets/metamask-preparation/public-browser-results.json)。閲覧専用モードに切り替えた際は、保存済みの実接続フォームを復元しない。既存の下書きを残した両ブラウザで、接続ボタン・入力欄・ウォレット初期化がないことを確認した。[閲覧専用結果](assets/metamask-preparation/readonly-results.json)。再現は `verify-live-ui.mjs` の `LIVE_READONLY_UI_URL` を閲覧専用ビルドに指定する。
