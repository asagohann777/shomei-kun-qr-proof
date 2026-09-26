[English](README.md) | 日本語

<p align="center">
  <img src="docs/submission/2026-09-26/branding/shomei-kun-icon.png" alt="証明くんロゴ" width="180">
</p>

# Shomei-kun QR Proof

QR、ENS名、ウォレットアドレスからカードの登録記録を確認できます。

![証明くんカバー画像](docs/submission/2026-09-26/branding/shomei-kun-cover.png)

## 概要

Shomei-kun QR Proofは、カードのQRコードを読み取り、どのウォレットに登録されているかを確認するアプリです。架空の野球選手「証明一郎」のトレーディングカードを使い、所有者がカードを登録し、第三者がその記録を確認する流れを体験できます。

主な入口はQRスキャンです。ENS名やウォレットアドレスでも検索できます。未登録のカードではニックネームを入力し、MetaMaskで登録を承認します。登録済みなら登録先の所有者と取引の詳細を表示します。閲覧にはウォレット接続は不要です。UIは日本語と英語に対応しています。

ENS名はSepoliaで解決し、カードの登録記録はCurvegrid Testnetで管理します。`shomeikun.eth`を検索すると、そのウォレットに登録されているカード一覧から登録記録を開けます。登録画面では、接続ウォレットの逆引きと正引きが一致した場合にPrimary nameを表示します。ENS名は表示用で、所有者と権限はアドレスで管理します。

カードID、登録したウォレットアドレス、ニックネームをブロックチェーンに記録します。誰でも同じQRコードから記録を再確認できます。このデモは一度限りの登録に対応し、登録後の編集・削除・所有権移転はできません。

記録はカードIDと登録先ウォレットを結び付けるものです。現物の所持、カードの真正性、法的所有権、本人の実名を証明するものではありません。QRコードをコピーしても同じ記録が表示されます。

## 使い方

1. カードのQRコードを読み取ります。
2. 未登録の場合は公開用ニックネームを入力し、MetaMaskで登録取引を承認します。
3. 登録後は同じQRコードから所有者と記録を確認できます。

- [テストネットデモ](https://shomei-kun-integration.dptr.workers.dev/ui/): 登録には発行済みの未登録カードと、テストネットのガス代を持つウォレットが必要です。
- [UIデモ](https://shomei-kun-ui-mock.dptr.workers.dev/): サンプルデータで画面を確認できます。実際の登録や送金は行いません。

iPhone・iPadではMetaMask内ブラウザから登録してください。ニックネームとウォレットアドレスは公開されるため、ニックネームに個人情報を含めないでください。

## スクリーンショット

英語UIのスクリーンショットです。

| 画面 | 画像 |
| --- | --- |
| ホーム | [表示](docs/submission/2026-09-26/screenshots/01-home-en.png) |
| QRスキャン | [表示](docs/submission/2026-09-26/screenshots/02-qr-scan-en.png) |
| 未登録カード | [表示](docs/submission/2026-09-26/screenshots/03-unregistered-card-en.png) |
| 所有者情報 | [表示](docs/submission/2026-09-26/screenshots/04-owner-information-en.png) |
| 登録内容確認 | [表示](docs/submission/2026-09-26/screenshots/05-review-en.png) |
| ウォレット承認 | [表示](docs/submission/2026-09-26/screenshots/06-wallet-approval-en.png) |
| 登録中 | [表示](docs/submission/2026-09-26/screenshots/07-registration-progress-en.png) |
| 登録完了 | [表示](docs/submission/2026-09-26/screenshots/08-registration-complete-en.png) |
| 記録詳細 | [表示](docs/submission/2026-09-26/screenshots/09-record-details-en.png) |
| ENS・アドレス検索 | [表示](docs/submission/2026-09-26/screenshots/10-ens-search-en.png) |
| 実接続の登録カード一覧 | [表示](docs/submission/2026-09-26/screenshots/11-ens-results-en.png) |
| 実接続のカード記録 | [表示](docs/submission/2026-09-26/screenshots/12-live-record-en.png) |

## 既存プロジェクトと今回の実装

本プロジェクトは[天地愛プロジェクトの「証明くん」](https://tennchiai.com/)の考え方をもとにしています。既存プロジェクトは、自分の記録を登録し、その出所や履歴を後から確認できる仕組みを目指しています。

今回はその考え方を現物のカード、QRコード、ウォレットによる登録へ適用しました。本リポジトリは独立した参照実装とデモです。既存PoCのソースコードやユーザーデータは持ち込んでいません。

| 区分 | 内容 |
| --- | --- |
| 既存成果 | 証明くんの構想、写真・動画登録、アルバム管理、公開範囲の設定、URLによる共有、外部証跡としてのブロックチェーン利用 |
| 本リポジトリでの開発 | カードID発行、QR読取、ウォレットによる所有者登録、ニックネーム記録、公開記録閲覧、日本語・英語UI、カメラ・写真からのQR読取、登録先を限定しない発行、ENS・アドレス検索、正引き確認済みPrimary nameの表示 |

既存機能の説明はプロジェクトから提供された資料に基づきます。出典と流用範囲は[既存成果](specs/PRE_EXISTING_WORK.ja.md)、実装と検証の記録は[開発記録](specs/HACKATHON_CHANGES.ja.md)を参照してください。

## ETHGlobal Tokyo 2026

Continuityトラックへの提出を準備しています。[公式ルール](https://ethglobal.com/events/tokyo2026/info/details)に従い、既存成果と新規機能を区別して記録しています。開発記録とコミット履歴で大会中の作業を示します。時期が未確認の作業を大会期間中の成果として主張しません。

Continuityには「Extend Open Source」と「Ship a Feature」があります。具体的な区分と各パートナー賞への応募資格は提出時に確認します。

## 実装と開発記録

UIはJavaScript、Tailwind CSS、daisyUI、APIはNext.jsとCloudflare Workersを使用しています。登録にはSolidity、Curvegrid MultiBaas、MetaMaskを使用します。ENSはSepolia上でethers 6.17.0により解決します。実接続デモはCurvegrid Testnetで検証しました。環境と検証結果は[登録デモ記録](specs/OPEN_REGISTRATION_DEMO.ja.md)を参照してください。

- [仕様書](specs/SPEC.ja.md)、[アーキテクチャ](specs/ARCHITECTURE.ja.md)、[デモ手順](specs/DEMO.ja.md)
- [UIのローカル起動](prototypes/mobile-ui/README.ja.md)、[API](apps/web/README.ja.md)、[コントラクト](contracts/README.ja.md)
- [仕様駆動開発の資料](openspec/)、[プロンプト記録](docs/prompts/README.ja.md)

チームメンバーが要件を定義し、画面配置、文言、素材を確認しました。AIは画像生成、実装、テスト、文書作成を補助しました。[プロンプト報告1](docs/prompts/asagohann777-prompt-report-1-2026-09-26.ja.md)には、人間がAIの提案を評価し修正した過程を記録しています。[開発記録](specs/HACKATHON_CHANGES.ja.md)にはファイルごとの作業と検証を記録しています。

## 素材とライセンス

UIの背景、ロゴ、カード画像は[おじいちゃんコンビニ（GitHub: @asagohann777）](https://github.com/asagohann777)から提供されました。[素材一覧](specs/assets/asagohann777/README.ja.md)と[提出用アイコン・カバーのmanifest](docs/submission/2026-09-26/branding/manifest.json)を参照してください。

本リポジトリのソースコードは[MIT License](LICENSE)で公開しています。このライセンスは提供された画像・ロゴや既存の証明くんプロジェクトには適用しません。依存関係はそれぞれのライセンスに従います。
