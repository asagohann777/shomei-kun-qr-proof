[English](CURVEGRID_INTEGRATION_IMPLEMENTATION.md) | 日本語（原文保存版）

# Curvegrid連携の実装・検証記録

2026-09-26 JST。詳細設計 `453387e` の承認後、最新UIを含む `main` の `cdb1ffe` へリベースし、PR #1で実装した。元のUI作業場所と `prototypes/mobile-ui` は変更していない。

## 実装した機能

- `contracts/src/OwnershipRegistry.sol`: 発行者固定、カードIDと許可先の発行、一度限りの本人登録、照会・イベント。
- `contracts/cli`: 配置、発行、照会、再開。ローカル署名、送信前の0600 state保存、同一取引の明示的な再送。
- `apps/web/src/backend`: MultiBaas live Gateway、配置設定、未署名calldataと取引・receipt・イベント・正規ブロックの照合。
- API: 既存3パスを維持し、`GET /api/v1/connection` とCORSを追加。liveの自由入力、設定不足、認証拒否、タイムアウトを区別する。
- `wrangler.integration.jsonc`: `shomei-kun-integration` 専用構成。既存mock構成と別に選択する。

Solidityから生成するABIをCLIとAPIで共有する。OpenAPIから公開型とWorkers用validatorを生成する。試験用の設定ファイルを使い、ローカルlive診断試験に実環境の認証情報が混入しないようにした。

## 検証結果

Node.js 22.23.1で実行。再実行するコマンドは [起動手順](CURVEGRID_INTEGRATION_RUNBOOK.ja.md) と [CLI手順](../contracts/README.ja.md) に記載した。

| 検証 | 結果 |
| --- | --- |
| Web APIのサービス・入力・設定・Gateway | 63件成功 |
| Next.js HTTP | mock 25件、live診断4件成功 |
| ローカルCloudflare Workers HTTP | mock 25件、live診断4件成功 |
| Solidity・CLIのローカルEVMとMultiBaas形式の試験 | 15件成功。実CLIの端末操作3件を含む |
| 型検証 | Web API・CLIとも成功 |
| ABI再生成一致 | 成功 |
| OpenAPI | 4操作、応答例55件、既存mock 19シナリオ、不正入力10件の検証に成功 |
| Next.js / OpenNext専用構成のビルド | 成功 |
| OpenSpec strict検証 | 成功 |

CLI端末試験では、その場で作成した暗号化テストキーストアとローカルEVMを使用した。配置後のリンク失敗からresumeし、再配置せずに発行・照会まで実行した。パスワード入力前にraw modeと入力リスナーを設定するよう修正し、入力内容が端末出力に残らないことを試験した。

制限環境ではNext.jsの子プロセス出力を取得できず、TypeScript設定読取りに失敗した。通常権限のローカル実行でビルドし直した。HTTP試験の型推論エラーは明示的なResponse型で修正した。外部デプロイは行っていない。

MultiBaasのAPI形式は公式SDK資料を参照し、合成応答でテストした。実環境で取得したfixtureではない。ライブの公開RPC・APIキー・権限・同期状態・スマホ署名は未検証である。

## 依存と残る確認

Web APIのnpm監査は0件。CLIの実行時依存も0件。Hardhatなどの開発依存には18件の監査指摘が残る。内訳はhigh 5、moderate 2、low 11。互換範囲の修正版を適用し、追加のmajor更新は行っていない。公開WorkerにHardhatを含めない。

実際のMultiBaas接続、コントラクト配置、専用URLへの公開、スマホのMetaMask復帰・別端末確認は未実施。[OpenSpec tasks](../openspec/changes/curvegrid-testnet-integration/tasks.ja.md) 6章に残している。公開チェーンで独立に照合するA07は達成扱いにしない。

## AIと人間の担当

ユーザーが仕様・担当分担を決め、詳細設計を承認し、最新UIへのリベースを指示した。CodexがAPI・コントラクト・CLI・試験・設定・生成物・手順書を作成した。コントラクト/CLIとGatewayを別エージェントが担当し、親エージェントがHTTP/OpenAPI/統合/変更記録を担当した。親側でもコントラクト試験を再実行した。別の読取り専用レビューで試験環境への設定混入を見つけ、試験用envで分離した。

大会期間との対応は未確認。既存「証明くん」のコード・利用者データは変更していない。
