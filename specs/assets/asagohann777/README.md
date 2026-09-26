# おじいちゃんコンビニのデザイン資料

制作者はおじいちゃんコンビニ、GitHub IDは `asagohann777`。ユーザーから受領した制作途中の図案・素材31点を保存している。2026-09-26に内容別に分類・改名した。画像は再圧縮・加工せず、Downloadsの原本も変更していない。

ファイル名はCodexの目視分類による整理名。`ja` は日本語、`en` は英語、番号は別案の識別用であり、制作順や採用順位ではない。制作日時、大会期間との対応、各画像でのAI使用範囲、公開ライセンスは未確認。

## 画面図案と素材

画面図案17点は `screens/`、背景11点は `backgrounds/`、ロゴ・QRイラスト・カード各1点は `logos/`・`illustrations/`・`cards/` に保存。

| 保存先 | 元ファイル名 |
| --- | --- |
| [backgrounds/atrium-with-text.jpg](backgrounds/atrium-with-text.jpg) | S__32849928.jpg |
| [backgrounds/atrium.jpg](backgrounds/atrium.jpg) | S__32849931.jpg |
| [backgrounds/garden-city-01.jpg](backgrounds/garden-city-01.jpg) | S__32849927.jpg |
| [backgrounds/garden-city-02.jpg](backgrounds/garden-city-02.jpg) | S__32849932.jpg |
| [backgrounds/garden-mountains-01.jpg](backgrounds/garden-mountains-01.jpg) | S__32849933.jpg |
| [backgrounds/garden-mountains-02.jpg](backgrounds/garden-mountains-02.jpg) | S__32849936.jpg |
| [backgrounds/waterfront-platform-01.jpg](backgrounds/waterfront-platform-01.jpg) | S__32849926.jpg |
| [backgrounds/waterfront-platform-02.jpg](backgrounds/waterfront-platform-02.jpg) | S__32849929.jpg |
| [backgrounds/waterfront-platform-03.jpg](backgrounds/waterfront-platform-03.jpg) | S__32849930.jpg |
| [backgrounds/waterfront-platform-04.jpg](backgrounds/waterfront-platform-04.jpg) | S__32849934.jpg |
| [backgrounds/waterfront-platform-aircraft.jpg](backgrounds/waterfront-platform-aircraft.jpg) | S__32849940.jpg |
| [cards/shomei-ichiro.jpg](cards/shomei-ichiro.jpg) | S__32849943.jpg |
| [illustrations/qr-scan.jpg](illustrations/qr-scan.jpg) | S__32849942.jpg |
| [logos/shomeikun-qr-proof-ja.jpg](logos/shomeikun-qr-proof-ja.jpg) | S__32849941.jpg |
| [screens/home-en.jpg](screens/home-en.jpg) | S__32833542.jpg |
| [screens/home-ja.jpg](screens/home-ja.jpg) | S__32833543.jpg |
| [screens/owner-input-en.jpg](screens/owner-input-en.jpg) | S__32833556.jpg |
| [screens/owner-input-ja.jpg](screens/owner-input-ja.jpg) | S__32833557.jpg |
| [screens/qr-result-en.jpg](screens/qr-result-en.jpg) | S__32833551.jpg |
| [screens/qr-result-ja.jpg](screens/qr-result-ja.jpg) | S__32833552.jpg |
| [screens/qr-scan-en.jpg](screens/qr-scan-en.jpg) | S__32833544.jpg |
| [screens/qr-scan-ja.jpg](screens/qr-scan-ja.jpg) | S__32833545.jpg |
| [screens/registering-en.jpg](screens/registering-en.jpg) | S__32841730.jpg |
| [screens/registering-ja.jpg](screens/registering-ja.jpg) | S__32841731.jpg |
| [screens/registration-complete-en.jpg](screens/registration-complete-en.jpg) | S__32841732.jpg |
| [screens/registration-complete-ja.jpg](screens/registration-complete-ja.jpg) | S__32841733.jpg |
| [screens/registration-confirm-en.jpg](screens/registration-confirm-en.jpg) | S__32833560.jpg |
| [screens/registration-confirm-ja.jpg](screens/registration-confirm-ja.jpg) | S__32833561.jpg |
| [screens/splash-en-01.jpg](screens/splash-en-01.jpg) | S__32833538.jpg |
| [screens/splash-ja-01.jpg](screens/splash-ja-01.jpg) | S__32833539.jpg |
| [screens/splash-ja-02.jpg](screens/splash-ja-02.jpg) | S__32833541.jpg |

## 受領記録

- [2026-09-25の画面図案9点](2026-09-25/README.md)。[制作会話の保存記録](../../../docs/prompts/asagohann777-design-2026-09-25.md)。
- [2026-09-26の追加画面図案](2026-09-26/README.md)。新規8点と既存4点。制作プロンプトは未受領。
- [2026-09-26の素材14点の保存依頼](../../../docs/prompts/2026-09-26/021211-868626-51f78af96f3c4863a9341b595e738b68.json)。制作プロンプトは未受領。

新しい素材の内容はmanifestの `description` に記録した。ロゴとQRイラストは白背景のJPEG。カード周囲の市松模様もJPEGの画素であり、透明部分ではない。

## 検証

[manifest.json](manifest.json)に旧名・保存先・受領バッチ・容量・SHA-256を記録した。全31点の内容一致を確認した。このディレクトリで `shasum -a 256 -c SHA256SUMS` を実行して再確認できる。

Codexは保存・分類・改名・参照リンク更新・照合・記録作成を担当した。画像の生成・編集は行っていない。
