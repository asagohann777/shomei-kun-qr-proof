# Proposal

## Why
ENS名から発行先を指定し、同じウォレットに登録されたカードを検索できるようにする。QRを起点とする既存操作を維持して、ENSv2 Continuity向けの実連携を追加する。

## What Changes
- CLIに任意の受取人ENS指定を追加。省略時の全員許可とwallet指定を維持。
- WebにENS名からの登録カード一覧と既存詳細への導線を追加。
- Sepolia ENSv2の解決とCurvegridのowner別イベント検索を追加。
- 親名取得、カード別サブネーム、ENSコントラクト新規配置は行わない。

## Capabilities
### New Capabilities
- `ens-wallet-card-search`: 任意のENS指定発行と、解決先ウォレットの登録カード検索。
### Modified Capabilities
なし。既存の登録要件は維持する。

## Impact
contracts CLI、apps/web API・OpenAPI、mobile-ui、仕様と提出資料。既存コントラクト・カードの移行なし。秘密鍵はCLI端末に保持。
