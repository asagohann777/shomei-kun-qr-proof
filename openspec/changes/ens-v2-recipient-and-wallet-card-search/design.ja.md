[English](design.md) | 日本語

# Design

## Context
既存CLIにはwallet指定と署名済み取引の保存・再開がある。CardRegisteredのownerはindexedで、実RPCのowner指定eth_getLogsで既存記録を取得できた。MultiBaasの既存GET /events全件走査では一覧取得が過大になる。

## Goals / Non-Goals
Goals: 任意のENS検索・名前表示、アドレス別の検証済み一覧、制限なしの新規発行、既存QR操作の互換性。
Non-Goals: ENSへの書込み、親名・サブネーム取得、Registry/Resolver配置、移転・販売、全ネットワークの資産一覧。

## Decisions
- ENS_SEPOLIA_RPC_URLはAPIの任意設定で、検索・Primary name表示に使用する。ethersのENSIP-15正規化とSepolia Universal Resolverを使用。発行・登録にはENSを要求しない。
- 新規issueはallowedWalletをゼロアドレスに固定する。旧--recipient-ens / --walletは削除対象。既発行カードと保存済み署名取引を改変しない。現行実装には旧オプションが残るため、移行までは指定せずに発行する。
- GET /api/v1/ens/cards?name=...&cursor=...。新規検索時にENSを解決、Curvegridの基準block/hashを固定。続きでも再解決し、アドレスが変われば409で再検索させる。
- 最大2000ブロックを降順走査。1ページ最大20件、カーソルに基準hash・owner・次block/log位置を保持。上流範囲制限は二分して再試行、単一ブロック失敗は503。処理時間上限内で未完了ならカーソルを返す。
- イベントのcardKey/owner/emitterを検証し、既存transaction/receipt/card照合でconfirmedのもののみ返す。不一致は省略せず503。カードIDを重複排除、基準hash変更は409。空一覧はcompleteのときのみ0件。
- UIはQR主操作を保ち、ENS検索を補助導線にする。日英、未接続読取り、取得中/未解決/未完了/0件/失敗を分離。一覧から既存cardId詳細へ遷移。

## Risks / Trade-offs
- 名前が変わる: 再検索では追従、発行済みカードは不変。
- 2チェーンの役割: ENSはSepolia、カードはCurvegrid。ENSがなくても登録できる。
- 全期間検索の負荷: 範囲分割と続き取得。今回DBインデクサーは導入しない。
- ENSのCCIP Read: public-only fetchで内部宛先を拒否し、タイムアウトを設定。
- 応募: ENSv2の実レコードを使ったデモ、公開コード・URLが必要。コード完成だけで応募条件充足としない。

## Migration Plan
OpenAPI生成、既存テストと新規試験、別検証Worker、公開先反映の順。ENS設定を追加しなくても既存機能は稼働。ロールバックは直前Worker版へ戻す。コードと仕様・プロンプトはGit対象、カード生成物・秘密情報は対象外。

## Open Questions
shomeikun.ethの正引き・逆引き一致と実接続検索は確認済み。旧カードのiPhone終了後の結果不明は未解決。制限なしの別カードは登録成功したが、復旧修正とは区別する。

## Primary name scope addition
The connected registration wallet is reverse-resolved on Sepolia through the existing ethers provider, then explicitly forward-checked. A separate optional display endpoint returns a nullable name. The browser keeps a generation counter per address, clears the previous name before starting a new lookup, and ignores stale completions. No registration, permission or stored-card field depends on this enrichment. Mock name-present/unset states are UI fixtures. ENS display and search do not restrict card recipients.
