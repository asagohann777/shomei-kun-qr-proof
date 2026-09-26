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

## 実機報告を受けた再調査

ユーザーから、アプリは開くがブラウザは開かないと再報告があった。前提「正しいHTTPSリンクを生成できれば、アプリ側も行き先を処理する」は実機では成立していない。確認範囲を分ける。

| 段階 | 確認できたこと | 未確認・失敗 |
| --- | --- | --- |
| アプリのWeb UI | iPhone/iPad判定とカードID付きリンクの生成 | なし |
| SafariからOSへの移動 | ユーザー実機でMetaMask起動 | アプリへ届いたURL全体は取得できない |
| MetaMaskのリンク処理 | 公式ソースはdappをブラウザへ渡す | ユーザー実機はホーム画面で停止 |
| 自動ブラウザ試験 | hrefとクリックを検証 | 実アプリ起動前で抑止しており、この失敗を検出できない |

MetaMask公式の `parseDeeplink.ts` は `metamask://` を `https://link.metamask.io/` に正規化し、`handleDappUrl.ts` がブラウザへ対象URLを渡す。この直接スキームを使う形へ変更する。ただし、アプリ内で止まる原因の特定・解消を断定しない。開かなかった場合は同じカードのHTTPS URLをコピーしてアプリ内ブラウザへ貼り付けられるようにする。コピーAPIが失敗しても読取り専用欄から手動コピーできる。

参照: [公式リンク解析](https://github.com/MetaMask/metamask-mobile/blob/main/app/core/DeeplinkManager/utils/parseDeeplink.ts)、[公式dapp処理](https://github.com/MetaMask/metamask-mobile/blob/main/app/core/DeeplinkManager/handlers/intent/handleDappUrl.ts)。

直接スキーム版をversion `f356b57a-c981-4ce6-975d-9d5e0d4f7a21` へ公開。単体76件成功、Chromium/WebKitで直接リンクのクリック、カードURLコピー、iPad判定、アプリ内接続を確認した。公開資産24件がビルドと一致。[直接リンク版の結果](assets/apple-metamask-browser/direct-link-results.json)。実機のブラウザ起動成功は未確認。

## ユーザー実機での確認

直接リンク版の公開後、ユーザーから「開いたわ」と報告があり、MetaMask内ブラウザが開いたことを確認した。端末種別はこの報告では未指定。iPhone・iPad両方の実機成功や、登録完了までを確認したとは扱わない。
