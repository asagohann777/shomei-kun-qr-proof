[English](proposal.md) | 日本語

# Proposal

## Why

現状のAPIは固定モックで、MultiBaas・署名・チェーン記録を検証できない。UI開発と分離したURLでCurvegrid Testnetへの実接続を試すため、API・コントラクト・発行者CLIの詳細設計を先にレビューする。

## What Changes

- `apps/web` にlive Gatewayと接続確認APIを追加する設計。既存mockの挙動を維持する。
- 設定からチェーン・コントラクトを選び、自由入力のニックネームを本人取引で記録する。
- 発行者を固定した一度限りの所有者登録コントラクトと、配置・発行・照会CLIを新規設計する。
- 別Workerで公開するAPIとUI担当の画面・MetaMask接続の境界を定義する。
- 計画保存、Draft PR、詳細設計、ユーザー承認、実装の順に進める。文書だけのPRを先に作成し、明示的な設計承認後にコードを追加する。

## Capabilities

### New Capabilities

- `curvegrid-registration-backend`: Curvegrid Testnet向けのMultiBaas接続、公開読取り、本人登録用取引作成、記録照合、発行者CLIと配置設定。

### Modified Capabilities

なし。`openspec list --specs` は0件。既存の `specs/` の実装済みmock契約は保持し、承認後の差分をこのchangeで定義する。

## Impact

設計本文は [計画](../../../specs/CURVEGRID_INTEGRATION_PLAN.md) と [詳細設計](../../../specs/CURVEGRID_INTEGRATION_DESIGN.md) に置く。将来のコード変更対象は `apps/web/src/backend`、API Route Handler、OpenAPI、コントラクト・CLI、Workers構成。ブラウザ画面・MetaMask SDKはUI担当。

Amoyの80002固定をlive配置設定に置き換えるが、mockの既存応答値は変更しない。Curvegrid Testnetは独立した公開RPCによる検証の受け入れ条件を満たしたとは扱わない。実接続値・APIキーは未設定。コード実装は承認済み。マージ・公開は別途の指示に従う。

## 2026-09-26の追加指示

ユーザーが最新mainのUIへのAPI接続・署名と環境変数によるmock維持を指示した。[UI接続計画](../../../specs/UI_LIVE_CONNECTION_PLAN.md) の範囲でブラウザ実装をこのPRに追加する。UIデザインは並行継続し、既存のmock公開先は維持する。

2026-09-26訂正: デモは任意の本人ウォレットが初回登録できる全員許可に変更する。エラー受付IDと診断コピーも追加し、既存記録を変更せず新記録先で実測する。
