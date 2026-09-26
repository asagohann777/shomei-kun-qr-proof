# 提出用スクリーンショットと画像素材

2026-09-26 JST。ユーザーの指示で統合したmain `5d3e676` を撮影元とした。ローカルとorigin/mainの履歴統合はpush済み。元の未追跡ファイル14件はバイト一致で保全した。

## 英語スクリーンショット

[画像9枚](../docs/submission/2026-09-26/screenshots/)と[撮影記録](../docs/submission/2026-09-26/screenshots/capture.json)。ホーム、QRスキャン、未登録カード、所有者入力、確認、承認、処理中、完了、詳細の順。

最新版コードをmock API / mock wallet / mock cameraでビルドし、Chromiumで実際に画面を操作して撮影した。英語、390×844 CSS px、deviceScaleFactor 2、全ページ撮影。PNG幅は780px、高さはページ内容に応じる。画像加工はしていない。画像内の日本語ブランドロゴは提供素材のまま。

これらはUIデモの画面であり、実カメラ、MetaMask、実ブロックチェーン取引の証跡ではない。処理中は安定したプレビュー状態。詳細画面のネットワークや取引情報も既存の模擬値であり、実接続先の証明には使用しない。画面に表示されるデモ表記を保持した。

ビルド成功。9枚を目視確認し、文字・ボタンの表示、画像読込み、横はみ出しなしを確認。撮影中のpageerror・console errorは0件。アプリの仕様や画面実装は変更していない。

再撮影用スクリプト: `prototypes/mobile-ui/scripts/capture-submission.mjs`。同ディレクトリで `npm run build`、`python3 -m http.server 4189 --directory dist --bind 127.0.0.1` を起動し、別端末からNode 22以上で `node scripts/capture-submission.mjs` を実行する。

## 指定画像の保存

- [アイコン](../docs/submission/2026-09-26/branding/shomei-kun-icon.png): `ChatGPT 画像 2026年9月25日 17_29_33.png`
- [カバー画像](../docs/submission/2026-09-26/branding/shomei-kun-cover.png): `ChatGPT 画像 2026年9月25日 17_29_12.png`
- [原名・寸法・SHA-256](../docs/submission/2026-09-26/branding/manifest.json)

指定順に役割を割り当ててコピー・改名した。Downloadsの原本は保持。リサイズ・切抜き・再圧縮・画像生成は行っていない。原本とのバイト一致を確認した。今回の生成プロンプト、生成日時、公開ライセンスは追加確認していない。ファイル名の日付を生成日時の検証結果として扱わない。

## README用の参照先

ルートREADMEにはスクショへのリンクだけを追加した。仕様書とREADME本文は別セッションで作成予定のため変更していない。画像素材をREADMEから参照する場合の相対パスは以下。

- `docs/submission/2026-09-26/branding/shomei-kun-icon.png`
- `docs/submission/2026-09-26/branding/shomei-kun-cover.png`
- `docs/submission/2026-09-26/screenshots/`

人間が提出用の英語指定、素材の用途とREADMEの範囲を決定。Codexが撮影スクリプト作成、撮影・目視確認、コピー・改名・ハッシュ照合、保存記録を担当した。今回の作業と大会期間の対応は未確認。ユーザーからcommit・pushの指示を受領したため、スクショ・素材・保存記録と対応するプロンプトを本変更に含める。デプロイは対象外。
