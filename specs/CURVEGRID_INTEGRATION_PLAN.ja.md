[English](CURVEGRID_INTEGRATION_PLAN.md) | 日本語

# Curvegrid連携の計画

状態: 2026-09-26 JST、詳細設計と同じPRでの実装を承認済み。計画保存→設計確認の履歴は [変更記録](HACKATHON_CHANGES.md) を参照。

[詳細設計](CURVEGRID_INTEGRATION_DESIGN.md) / [Draft PR #1](https://github.com/asagohann777/shomei-kun-qr-proof/pull/1)

## 目的

UI検討用とは別URLで、Curvegrid Testnetへの接続、本人ウォレットによるカード所有者登録、登録情報の再取得を試せる状態にする。MultiBaas APIを中心に、既存の固定モックAPIを実接続へ拡張する。設計承認後、同じPRで実装する。

## 作業手順

1. 専用worktreeと `feat/curvegrid-integration-backend` ブランチを作る。現在のチェックアウトはUI担当の作業用として維持する。
2. この計画を保存し、計画と出典記録だけのコミットでDraft PRを作る。
3. 未実装部分を調査し、`specs/CURVEGRID_INTEGRATION_DESIGN.md` に詳細設計を保存して同じPRへ追加する。
4. PRと設計書を提示し、ユーザーの明示的な設計承認を待つ。承認前は実装コード・依存関係・デプロイ設定を変更しない。
5. 承認後、同じブランチとPRでバックエンドを実装・検証する。設計承認の対象コミットを記録する。マージは別途の指示に従う。

## 担当範囲

| 担当 | 対象 |
| --- | --- |
| バックエンド担当 | MultiBaas実接続、Web API、所有者登録コントラクト、発行者CLI、バックエンド用の別URL、試験・設定手順 |
| UI担当 | 画面、日英表示、通常ブラウザからのMetaMask接続、署名操作、復帰・再確認の表示 |
| 共同で確認 | API契約、ウォレットへ渡す取引、公開ネットワーク設定、エラーと状態の意味 |

別URLの簡易画面もUI担当が所有する。バックエンド担当は画面・ブラウザSDKを実装しない。UI担当が実装できる入出力例と接続手順を詳細設計へ含める。共有するOpenAPIは設計レビューで境界を確定してから更新する。

## 接続と登録の方針

- 初回の実接続先はCurvegrid Testnet。MultiBaas環境はユーザーが作成済みで、接続情報は後から設定する。
- サーバーからMultiBaasで状態読取り、未署名取引作成、取引・レシート・イベント取得を行う。`signAndSubmit: false` を固定する。
- 通常ブラウザからMetaMaskへ接続し、利用者本人が署名・送信する。管理APIキーとウォレット用公開Web3 RPC設定を分離する。
- 所有者登録コントラクトを新規作成する。発行者だけがカードIDと許可ウォレットを発行し、許可された本人だけが一度登録できる。所有者移転、取消し、上書きは提供しない。
- 発行者の配置・発行操作はCLI。ローカルの暗号化キーストアを使い、署名鍵をWebアプリへ渡さない。
- ニックネームは自由入力。UTF-8で1〜96バイト、空白除去・Unicode正規化なしという値は設計提案であり、今回のレビューで確認する。
- `apps/web/` を拡張し、Cloudflareの独立Worker `shomei-kun-integration` へ配置する案とする。既存UIモックのURLは維持する。
- 既存モックAPIの応答例と試験を維持する。接続障害からモックへ自動切替しない。

Amoy移行、公開チェーンでの独立した第三者照合、既存PoCとの接続、既存UIモックの変更は今回の対象外。

## 詳細設計で確定する事項

| 分野 | 設計内容 |
| --- | --- |
| APIとUIの接続契約 | 既存3 APIの実接続化、接続確認API、自由入力、チェーン設定、エラー、CORS、要求・応答例 |
| Gateway | 利用するMultiBaas API、応答変換、認証・タイムアウト、イベント同期遅延、取引・登録内容の照合 |
| コントラクト | ABI、保存構造、発行・登録イベント、権限、入力制約、重複・上書き拒否 |
| CLI | 配置、ABI登録・紐付け、カード発行、照会、再実行、ローカル署名鍵 |
| ウォレットへの引渡し | 未署名取引の形式と照合、Web3設定、アカウント・チェーン変更、拒否、送信後の再確認 |
| 配置と検証 | 独立Worker、Secretと公開設定、未設定時の動作、試験と完了条件 |

## OpenSpec

OpenSpecの初期化は済んでいるが、この計画保存時点でchangeはない。`openspec-update-change` は既存artifactの修正用なので、初回は `openspec-propose` の手順で `curvegrid-testnet-integration` を作成する。以後の設計修正は `openspec-update-change` を使う。

本文はリポジトリのルールどおり `specs/` に置く。OpenSpecには提案、要件、設計への参照、未完了タスクを置く。CLI上のartifact完成はユーザーの設計承認を意味しない。

## 完了条件

設計段階では計画、詳細設計、API例、UIとの担当境界、実装タスクをPRでレビュー可能にする。文書の整合性を検証し、実装や実環境接続を実施済みと記録しない。

設計承認後は、既存モック試験、コントラクトの権限・二重登録拒否、Gatewayの障害処理、Next.js・WorkersのHTTP試験を実施する。接続情報の設定後に専用URLで実環境を確認し、スマホ署名・復帰はUI担当と結合試験する。設定前の試験を実環境の疎通成功とは扱わない。

## 出典

- [Curvegrid Testnetと別URLの依頼](../docs/prompts/2026-09-25/201954-608359-10ee560f85bf438a9719f628ceadc4b0.json)
- [ブランチ・PR・設計レビューの指示](../docs/prompts/2026-09-25/202746-820949-ef57f69d6cb24768bc80b6fecc3446ef.json)
- [この手順の実行指示](../docs/prompts/2026-09-25/203111-203270-0c1f2dbe99cc4e19af3fb1ab5528d7b4.json)
- [選択結果の手動記録](../docs/prompts/curvegrid-integration-decisions.md)
