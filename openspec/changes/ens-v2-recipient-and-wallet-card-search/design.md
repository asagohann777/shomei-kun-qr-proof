# Design

## Context
既存CLIにはwallet指定と署名済み取引の保存・再開がある。CardRegisteredのownerはindexedで、実RPCのowner指定eth_getLogsで既存記録を取得できた。MultiBaasの既存GET /events全件走査では一覧取得が過大になる。

## Goals / Non-Goals
Goals: 任意ENS指定、アドレス別の検証済み一覧、既存操作の互換性。
Non-Goals: ENSへの書込み、親名・サブネーム取得、Registry/Resolver配置、移転・販売、全ネットワークの資産一覧。

## Decisions
- ENS_SEPOLIA_RPC_URLをCLI/APIで任意設定し、ENS操作時のみ必要とする。ethersのENSIP-15正規化とSepolia Universal Resolverを使用。Ethereum address recordを解決し、CLIは両チェーン上のEOAを確認。
- issue --recipient-ens NAMEは--walletと排他。解決結果を表示して確認、署名前に再照合。stateの任意ENSメタデータで名前・確定アドレスを保存。再開は保存済み署名取引のみ使用し、再解決不要。旧stateも読める。
- GET /api/v1/ens/cards?name=...&cursor=...。新規検索時にENSを解決、Curvegridの基準block/hashを固定。続きでも再解決し、アドレスが変われば409で再検索させる。
- 最大2000ブロックを降順走査。1ページ最大20件、カーソルに基準hash・owner・次block/log位置を保持。上流範囲制限は二分して再試行、単一ブロック失敗は503。処理時間上限内で未完了ならカーソルを返す。
- イベントのcardKey/owner/emitterを検証し、既存transaction/receipt/card照合でconfirmedのもののみ返す。不一致は省略せず503。カードIDを重複排除、基準hash変更は409。空一覧はcompleteのときのみ0件。
- UIはQR主操作を保ち、ENS検索を補助導線にする。日英、未接続読取り、取得中/未解決/未完了/0件/失敗を分離。一覧から既存cardId詳細へ遷移。

## Risks / Trade-offs
- 名前が変わる: 再検索では追従、発行済みカードは不変。
- 2チェーンのアドレス差: 解決アドレスを明示し、CLIでEOAを限定。
- 全期間検索の負荷: 範囲分割と続き取得。今回DBインデクサーは導入しない。
- ENSのCCIP Read: public-only fetchで内部宛先を拒否し、タイムアウトを設定。
- 応募: ENSv2の実レコードを使ったデモ、公開コード・URLが必要。コード完成だけで応募条件充足としない。

## Migration Plan
OpenAPI生成、既存テストと新規試験、別検証Worker、公開先反映の順。ENS設定を追加しなくても既存機能は稼働。ロールバックは直前Worker版へ戻す。コードと仕様・プロンプトはGit対象、カード生成物・秘密情報は対象外。

## Open Questions
操作可能なSepolia ENSv2名とRPCは実接続前に確認する。候補名がない場合は実演の前提不足を報告し、勝手に親名を取得しない。

## Primary name scope addition
The connected registration wallet is reverse-resolved on Sepolia through the existing ethers provider, then explicitly forward-checked. A separate optional display endpoint returns a nullable name. The browser keeps a generation counter per address, clears the previous name before starting a new lookup, and ignores stale completions. No registration, permission or stored-card field depends on this enrichment. Mock name-present/unset states are UI fixtures. This addition preserves optional ENS recipient issuance and wallet-card search.
