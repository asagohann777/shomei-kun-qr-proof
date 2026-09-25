# QR登録機能のアーキテクチャ

状態: 2026-09-25の追加指示により、MultiBaas API中心・Polygon Amoyへ改訂した設計。以下の実接続構成は未実装。接続環境の確認・互換性検証も未実施。相談用UIモックの構成は [UI_MOCK_PLAN.md](UI_MOCK_PLAN.md) を参照する。

固定モックAPIは [apps/web](../apps/web/README.md) に実装した。MultiBaas・署名・送信は模擬し、既存UIへの接続と実接続構成の実装は後続とする。検証結果は [BACKEND_IMPLEMENTATION.md](BACKEND_IMPLEMENTATION.md) を参照する。

## 構成と責務

既存PoCから独立した追加機能として構成する。既存「証明くん」のコード・データ・保存先に接続しない。

```text
[Card QR] --> [Browser] --> [Next.js server / Cloudflare Workers]
[Next.js server] --> [MultiBaas API] --> [Polygon Amoy registry]
[Browser] --> [MetaMask mobile] -- signed register tx --> [Amoy]
[Issuer CLI] -- reads / unsigned tx / receipts --> [MultiBaas API]
[Issuer CLI] -- issuer-signed issue tx via RPC --> [Amoy]
[Third party] -- Amoy RPC / Polygonscan --> [Amoy records]
```

| 要素 | 責務 |
| --- | --- |
| 参照実装のコントラクト | 発行権限、カード存在、許可ウォレット、一度限りの登録を検証する。所有者とニックネームの正本を保持する |
| 発行者CLI | MultiBaas APIで未署名取引を作成し、CLI側の発行者署名でAmoyへ送信する。APIで結果を確認し、公開ページURLを出力する |
| デモアプリ | QRの遷移先、登録確認、ウォレット接続、日英表示を提供する。サーバーからMultiBaas APIで公開読取り、未署名取引の作成、レシート・イベントの照会を行う |
| MetaMask | 利用者が登録取引を確認・署名・送信する。秘密鍵をアプリへ渡さない |
| MultiBaas | Amoy向け環境でコントラクトAPI、取引作成、レシート取得、イベント同期・検索を提供する |
| Polygon Amoy | コントラクトを実行し、所有者・ニックネーム・取引・イベントの正本を保持する |
| 第三者用の照合手順 | アプリとMultiBaasから独立して、Amoy RPCとPolygonscanで記録を確認する方法を示す |

## 技術選定と根拠

| 技術 | 扱い・選定理由 | 未検証事項 |
| --- | --- | --- |
| Next.js・TypeScript | ユーザー指定。デモUIと必要なサーバー処理を管理する | 実装時のバージョンと依存パッケージ |
| Cloudflare Workers・OpenNext | Next.js本体のビルドをWorkersへ適用する採用案 | Next.js・OpenNextの互換性、Workersランタイムでの動作 |
| MetaMask Connect | スマホの通常ブラウザからMetaMaskアプリへ接続する | Amoyのネットワーク追加・切替、アプリ往復、対象端末 |
| Polygon Amoy | 公開テストネット上で第三者が記録を照合できるよう、ユーザーが選択 | RPC・Faucetの利用条件、取引確認と再照会の動作 |
| MultiBaas API | 状態読取り、未署名取引の作成、レシート・イベント取得を共通のAPIで扱う | Amoy向け環境の利用可否、API権限、イベント同期、SDKバージョン |
| 登録専用コントラクト | 発行者・登録者の権限をチェーン側で強制する | 具体的なABI、ビルド・デプロイツールと試験 |

Cloudflareの現行ガイドは新規Next.jsアプリにvinextを推奨している。本計画ではNext.js本体のビルドを使うためOpenNextを選定した。互換性確認前に動作実績があるとは扱わない。

通常のアプリ読取りは、Next.jsのサーバー処理からMultiBaas APIを呼ぶ。ブラウザはアプリのカード読取り・取引作成・状態確認用の窓口を使い、MultiBaasのAPIキーを受け取らない。API障害時に通常の読取りを別RPCへ自動切替する機能は設けず、確認不能を明示する。独立した外部照合はAmoy RPCとPolygonscanで行う。

MultiBaasはAmoyの記録を扱うアクセス層であり、所有者の正本はコントラクトにある。イベント検索の結果が空でも未登録とは判断しない。所有者情報を別のデータベースに複製して正本にする構成は採用しない。

## 識別と記録

今回の発行単位は、特定チェーンに配置された1つの登録用コントラクトとする。カードの識別子は `chainId + contractAddress + cardId` の組であり、カードIDはこの発行単位内で一意とする。発行者は配置時に固定する。

QRは発行単位とカードを特定できる公開ページURLを指す。URLから未承認のRPCや任意のコントラクトへ接続しない。アプリが対応する配置情報と照合して対象を決める。QRに署名鍵、登録用秘密情報、ニックネームを格納しない。

| 情報 | 正本・取得元 | 用途 |
| --- | --- | --- |
| チェーンID・コントラクト・配置ブロック | 配置記録とチェーン照会 | 対象の固定、イベント検索範囲、外部照合 |
| 発行者 | コントラクト | 発行権限と公開表示 |
| カードID・存在・許可ウォレット | コントラクト | 未発行と未登録の区別、登録権限 |
| 登録所有者・ニックネーム | 同一取引で保存したコントラクト状態 | 現在の登録情報 |
| 発行・登録イベント | Amoyのログ。アプリではMultiBaasのイベントAPIで取得 | 操作履歴と登録取引ハッシュの取得。同期遅延とイベント不存在を区別する |
| カード画像・選手名 | デモ用素材 | 表示用。素材の出典と許諾を記録する |
| 言語選択・追跡中の取引ハッシュ | ブラウザ内の設定・処理情報 | 再訪時の表示、復帰後の再照会。所有者の正本にはしない |

オンチェーンの許可ウォレットやイベントも読取り可能な情報として扱う。ニックネームは原文のまま保存・表示し、HTMLとして実行しない。

## 最小インターフェース

以下は実接続時の責務と入出力の定義である。Web APIの固定モック契約は [BACKEND_DESIGN.md](BACKEND_DESIGN.md) と [openapi.yaml](openapi.yaml) に定義した。ABI・Gatewayの実接続型・CLIコマンド名は後続の設計で確定する。

| 操作 | 入力 | 結果・制約 |
| --- | --- | --- |
| 発行 | カードID、許可ウォレット、発行者の署名 | 発行済み・未登録のカードを作成し、発行イベントを残す。重複、無権限、不正な入力を拒否する |
| 登録 | カードID、ニックネーム、接続ウォレットの署名 | 送信者が許可ウォレットと一致するときだけ、所有者とニックネームを原子的に保存する。未発行・登録済みを拒否する |
| 公開読取り | 対応する発行単位、カードID | 存在、登録状態、発行者、所有者、ニックネームを返す。通信エラーは状態の値に変換しない |
| 登録イベント照会 | コントラクト、カードID、配置以降の範囲 | 対応する登録取引ハッシュを取得する。ブラウザ保存値だけを証跡にしない |

アプリのサーバーは対象コントラクトと許可する操作を固定し、任意のMultiBaas APIへ中継できる窓口にはしない。クライアントから渡されたアドレスは取引作成用の入力であり、本人確認の根拠ではない。最終的な登録権限はAmoy上のコントラクトが検証する。

登録先の所有者アドレスを任意に渡す方式にはしない。コントラクトが取引の送信者を所有者として扱う。UIの制約を回避して直接取引しても、同じ権限と一度限りの登録制約が適用される。

登録内容の更新、削除、許可ウォレットの変更、管理者による上書き、アップグレードによる制約の変更を提供しない。デモを繰り返す場合は新しいカードIDを発行する。

## データの流れ

### 発行

発行者は登録予定者の公開アドレスを事前に受け取り、CLIでカードIDと許可ウォレットを指定する。CLIはMultiBaas APIで接続先と発行権限を確認し、未署名の発行取引を作成する。対象を確認してCLI側で署名し、Amoy RPCへ送信する。MultiBaas APIで成功レシートと発行済み状態を照合してから完了とし、公開ページURLをカードのQRに使用する。この時点の所有者は未登録である。

### 登録

1. 利用者がQRから公開ページを開く。アプリのサーバーはMultiBaas APIでAmoy上のカードの存在と登録状態を照会する。
2. 発行済み・未登録のときだけ登録へ進める。公開される情報と変更・削除不可の説明を表示する。
3. MetaMask ConnectでスマホのMetaMaskアプリへ接続する。実際のアドレスとAmoyのチェーンID 80002を確認する。
4. サーバーがMultiBaas APIで未署名の登録取引を作成する。ブラウザでも送信先、チェーン、操作、カードID、ニックネームを確認し、MetaMaskへ渡す。
5. 本人がMetaMaskで署名・送信する。送信直前にもアカウントとチェーンの変更を確認する。アプリは取引ハッシュを保持し、MultiBaas APIでレシートと状態を照会する。
6. 成功レシートと対象カードの登録内容の一致を確認してから成功を表示する。署名拒否、送信前の失敗、送信後の確認不能を区別する。

登録用テスト資金は事前に準備する。スマホ復帰時に応答を取り逃した場合はチェーン状態と判明している取引を再照会し、自動再送しない。ウォレットを切り替えても、既に送った取引の対象と送信者を取り違えない。

### 公開確認・外部照合

第三者のブラウザはウォレット接続なしでアプリの公開読取りを使う。サーバーがMultiBaas APIでカード状態と登録イベントを取得し、取引ハッシュを含む照合用情報を返す。

外部照合ではAmoyの状態、登録取引、レシート、イベントをMultiBaas以外のRPCへ直接照会する。チェーンID、記録先、カードID、所有者、ニックネームを比較する。Amoy Polygonscanの取引・コントラクトページへのリンクも表示する。第三者へMultiBaasのAPIキーを渡す必要はない。

状態取得に成功してもイベント同期が追い付かない、または証跡の取得だけが失敗した場合は、取得済みの情報と「証跡を確認できない」状態を区別する。同期遅延で未登録に戻したり、送信端末の確認済みレシートを取り消したりしない。存在しない取引ハッシュや未確認の取引へのリンクを補わない。

## 接続情報と鍵の境界

MultiBaas APIのURLと契約設定をAmoy向け環境に固定する。アプリ用キーは読取り・未署名取引作成に必要な最小権限とし、Cloudflareのサーバー側Secretに保存する。CLI用キーはローカルで管理し、アプリ用キーと分離する。どちらも配信ファイル、QR、公開リポジトリへ含めない。

MetaMaskと発行者CLIの送信にはAmoy RPCを使う。Curvegrid Testnet専用の公開Web3キーは使用しない。MultiBaasの接続設定、MetaMaskのチェーンID、配置先コントラクトを照合し、同じAmoyを指していることを確認する。APIが共通でも、別チェーンの配置・登録記録が自動的に移行することはない。

発行者の署名鍵はCLI側で管理し、ソースやプロンプトに保存しない。登録者の署名鍵はMetaMaskが保持する。アプリや発行者による代理署名を所有者本人の登録として扱わない。

MultiBaas APIの停止・制限・キー失効、Amoy RPCの障害時は該当する操作を確認不能として扱う。チェーン上の登録内容が消えた、または未登録になったとは表示しない。

## 確認が必要な環境情報

| 項目 | 現在の状態 |
| --- | --- |
| MultiBaasデプロイメント | Amoy向け環境の利用可否、API権限、契約の紐付け、配置ブロックからのイベント同期を実環境で確認する |
| チェーンID・通貨 | Polygon Amoy、80002、ガス代はテストPOL。公式資料で確認済み、実接続は未実施 |
| RPC候補 | `https://rpc-amoy.polygon.technology/`。公式掲載の公開RPC。接続性・利用制限を確認する |
| 外部確認先 | `https://amoy.polygonscan.com/tx/<txHash>`、`https://amoy.polygonscan.com/address/<contractAddress>` |
| 発行者アドレス・コントラクト・ABI・配置ブロック | 未作成 |
| Cloudflare環境・公開URL | 未作成 |
| 依存パッケージ・対象端末のバージョン | 実装前に互換性を確認し、検証時の値を記録する |

## 参照資料

確認日: 2026-09-25。以下は設計根拠であり、本アプリの動作確認結果ではない。

- [CloudflareのNext.jsガイド](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [CloudflareのOpenNextアダプター](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)
- [MetaMask Connect](https://docs.metamask.io/metamask-connect/)
- [Polygon公式のAmoy設定・テストPOL・Polygonscan案内](https://docs.polygon.technology/tools/dApp-development/common-tools/remix/)
- [MultiBaasのAPIキー](https://docs.curvegrid.com/multibaas/api-keys)
- [MultiBaasのフロントエンド構築とウォレット署名](https://docs.curvegrid.com/multibaas/getting-started/build-a-frontend/)
- [MultiBaasの取引レシート取得](https://docs.curvegrid.com/multibaas/api/get-transaction-receipt/)

要件と受け入れ条件は [仕様](SPEC.md)、実演は [デモ手順](DEMO.md) を参照する。
