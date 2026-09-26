[English](proposal.md) | 日本語（原文保存版）

# Proposal

## Why
ENS名またはアドレスからウォレットに登録されたカードを検索し、接続中ウォレットの検証済みPrimary nameを表示する。QRを起点とする既存操作を維持して、ENSv2 Continuity向けの実連携を追加する。

## What Changes
- ENSは検索・名前表示に任意で使う。新規発行は全員許可とし、旧CLIの受取人制限指定を削除する。
- WebにENS名・アドレスからの登録カード一覧と既存詳細への導線、正引き一致したPrimary name表示を追加。
- Sepolia ENSv2の解決とCurvegridのowner別イベント検索を追加。
- 親名取得、カード別サブネーム、ENSコントラクト新規配置は行わない。

## Capabilities
### New Capabilities
- `ens-wallet-card-search`: 任意のENS・アドレス検索と検証済みPrimary name表示。登録先を限定しない。
### Modified Capabilities
なし。既存の登録要件は維持する。

## Impact
contracts CLI、apps/web API・OpenAPI、mobile-ui、仕様と提出資料。既存コントラクト・カードの移行なし。秘密鍵はCLI端末に保持。
