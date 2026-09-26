[English](BACKEND_IMPLEMENTATION.md) | 日本語

# 固定モックAPIの実装計画と検証

2026-09-26 JST。[詳細設計](BACKEND_DESIGN.md)に沿って実装する。既存の静的UIモックと既存PoCには接続しない。

## 実装手順

- [x] how: 現状を確認。APIコードは存在せず、静的UIモックは `prototypes/mobile-ui/` に独立している。
- [x] architect skipped: 承認済みの詳細設計に構成・DTO・照合条件があるため、構成案の再比較は行わない。
- [x] Blocking first steps: 詳細設計、OpenAPI、Next.js・Cloudflareの互換条件を確認する。
- [x] Independent workstreams: 実装担当は `apps/web/src/`、親担当は構成・生成コード・試験・文書を担当する。
- [x] Shared mutable state: シナリオはリクエストごとに生成する。担当間で同じファイルを編集しない。
- [x] Smallest safe decomposition: API処理とGatewayの実装は1担当へ集約する。親担当が独立した試験で検証する。
- [x] Delegate code-writing: Route Handler、Service、Mock Gateway、Mock Walletの操作ライブラリを実装する。
- [x] Verify: 入力検証、照合、状態分離、OpenAPI整合性、Next.jsとWorkers上のHTTP応答を確認する。
- [x] 文書の実装状況と再実行手順を更新する。
- Rebase/commits、Opening a PRは省略。ユーザーの依頼は実装であり、commit・push・PR作成・公開の指示はない。
- interrogateは省略。構成は承認済みで、別案の選定は今回の対象外。

## 実装上の具体化

APIアプリは `apps/web/` に配置する。OpenAPIからDTO、サンプル、シナリオ表、JSON Schema検証関数を生成する。Workers内で動的コード生成をしないよう、Ajvの検証関数はビルド前に生成する。

Next.jsのRoute HandlerはHTTP境界を担当し、ServiceがGatewayの取引・レシート・イベント・カードを照合する。Mock Walletのライブラリは承認・拒否と確認を模擬し、既存画面への組込みは行わない。

Cloudflare構成は[既存アーキテクチャ](ARCHITECTURE.md)のOpenNext案を具体化する。[OpenNext公式の設定手順](https://opennext.js.org/cloudflare/get-started)とnpmのpeerDependenciesを確認し、互換範囲内のバージョンを固定する。デプロイは行わない。

## 検証記録

Node.js 22.23.1、Next.js 16.3.6、TypeScript 5.9.3、OpenNext Cloudflare 1.20.6、Wrangler 4.140.0を使用した。TypeScript 7はOpenAPI型生成ツールのpeerDependenciesに適合しないため、5.9.3へ固定した。

| 対象 | 試験の場所 | 確認内容 |
| --- | --- | --- |
| B01・B02 | HTTP試験、boundary、service | 未発行、登録済み、チェーン、許可ウォレット、サンプル名、入力とエラーの優先順位 |
| B03・B04 | HTTP試験 | 繰返し・並行要求による状態変更やシナリオ混在がないこと |
| B05・B06 | service、HTTP試験 | 取引・レシート・イベント・現在状態の不一致、失敗、未取得、確認中、通信失敗 |
| B07 | service、HTTP試験 | 証跡待ちで所有者を保持。検索結果が遅れてもレシート内イベントで確認可能 |
| B08 | boundaryのMock Wallet試験 | 拒否後に確認しない。結果不明から自動再送しない。画面への組込み試験は対象外 |
| B09 | service、boundary | fetch呼出しを失敗させた状態でMock Gateway・Walletが動作。実接続モジュールを含まないことも確認 |
| B10 | boundary、HTTP試験 | JSON・型・形式、シナリオ、UTF-8、Content-Type、本文16 KiBの境界。Content-Lengthの偽装に依存しない |
| B11 | HTTP試験、config、生成チェック | 全19シナリオの応答がOpenAPI例・スキーマと一致。mock明示、未設定・liveの起動拒否、liveへのモックヘッダー拒否 |

試験コードは [apps/web/tests](../apps/web/tests/)、再実行手順は [README](../apps/web/README.md) にある。サービス・入力境界・設定・Mock Walletの36試験が成功した。Next.js上で24件、ローカルWorkers上で同じ24件のHTTP試験が成功した。[Next.jsの実行結果](assets/backend/http-next.txt)と [Workersの実行結果](assets/backend/http-worker.txt)を保存した。

Workersの404ではOpenNextが `private, no-cache, no-store, max-age=0, must-revalidate` を付ける。初回試験は文字列の完全一致で4件失敗した。保存禁止の意味を保ったまま、OpenAPIと試験を `no-store` 指定必須・追加指定許容に修正した。

制限環境では非同期子プロセスの出力が空になり、Next.jsのTypeScript設定読取りが失敗した。通常権限のローカル実行でビルドした。Nodeの試験は各ケースを表示できるよう `--experimental-test-isolation=none` を指定した。試験ファイル単位の成功表示だけを件数に数えていない。

Type System Disciplineに従い、公開DTOはOpenAPIから生成した。Model the Domainに従い、カードと取引結果を判別可能な型で表し、シナリオはリクエストごとのGatewayに閉じた。Prove It Worksに従い、型チェックとビルドに加えてローカルサーバーへHTTP要求を送る。実接続試験の合格は主張しない。

OpenAPIの静的検証、生成物一致、型チェック、Next.jsビルド、OpenNextによるWorkersバンドル生成も成功した。既存UIの変更はないため画面の撮影試験は行っていない。スマホ実機、実ウォレット、MultiBaas・Amoy、発行者CLI、既存PoCへの接続、デプロイは未実施。
