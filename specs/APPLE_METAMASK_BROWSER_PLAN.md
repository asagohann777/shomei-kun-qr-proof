# iPhone・iPadはMetaMask内で登録する

2026-09-26。SafariからMetaMaskへ移動してもホーム画面だけが表示され、接続が `REQUEST_EXPIRED` で失敗するとの報告を受けた。ログでは接続アドレス・チェーンは未取得で、ネットワーク追加には進んでいない。アプリ側で接続要求が処理されない原因は未特定。ユーザーはMetaMask内ブラウザへの移動を提案し、iPadも同じ対応を依頼した。

## 決定

実接続モードのiPhone/iPad外部ブラウザでは、未登録カードの確認画面に「MetaMaskで開く」を表示する。MetaMask公式の `https://link.metamask.io/dapp/{url}` を通常のリンクとして開き、同じ公開URLとカードIDを渡す。接続要求を外部ブラウザから開始しない。ニックネームは移動後に入力する。保存済みの接続下書きからSDKを自動再開しない。

iPadはiPadのUser-Agentに加え、MacintoshのUser-Agentと複数タッチ点で判定する。MetaMask providerがある場合はアプリ内として扱い、再び開く導線を出さず既存の接続・追加・登録を使う。実接続以外のモック・閲覧専用と通常のMacは維持する。登録済みカードの閲覧にアプリ移動を求めない。

既存の白・淡青・青ボタン、書体、カード、中央レイアウトを維持する。確認画面の次の操作をアプリ移動へ変え、新しい画面を増やさない。MetaMask内では「Safariへ戻る」と案内しない。

## 検証

単体テストでiPhone/iPad/デスクトップ表示のiPad、通常Mac、MetaMask provider、モック・閲覧専用を確認。Chromium/WebKitで日英320/390/1365pxとiPad 820pxを描画し、アプリ移動リンクのカードID、SDK未起動、MetaMask providerでの接続を確認する。実アプリへの移動は自動試験では止めるため、実機でのリンク処理・承認完了は未確認。

## 参照

[MetaMaskの公式対応環境とdappリンク](https://docs.metamask.io/metamask-connect/supported-platforms/)を確認した。外部ブラウザとアプリ内ブラウザは別の保存領域なので、ニックネームや接続セッションをURLへ含めない。

## 実装・公開結果

単体76件成功。Chromium/WebKitでiPhoneとデスクトップ表示のiPadを模擬し、同じカードへのリンク、保存済みSDK接続を再開しないこと、MetaMask providerでは接続へ進むことを確認。日英320/390/1365pxとiPad 820pxを描画し、画像・横はみ出し・操作位置を確認した。アプリのコンソールエラー0件。WebKit撮影中の一時的なstylesheet CSP警告のみ既存試験と同じ扱いで除外した。[試験結果](assets/apple-metamask-browser/results.json)。

integration Worker version `77d732e4-0ad2-424c-88ad-bd6466962351` に反映。公開JS/CSS/HTML24件がビルドと一致。実カメラとモックの切替は維持した。

公開URLでも両ブラウザの同じ試験が成功した。[公開試験結果](assets/apple-metamask-browser/public-results.json)。アプリへのリンク移動は直前で抑止し、実機検証とは区別した。
