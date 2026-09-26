[English](BACKEND_DESIGN.md) | 日本語

# 固定モックによるWeb API詳細設計

状態: 2026-09-26 JSTの採用計画を具体化した設計。固定モックAPI・Gateway・Mock Walletの操作ライブラリを `apps/web/` に実装した。実接続は未実装。API契約の正本は [openapi.yaml](openapi.yaml)。既存の静的UIモックはこのAPIを呼んでいない。

## 採用範囲

Next.js・TypeScript・Cloudflare Workersを前提に、カード取得、登録準備、登録確認の3 APIを定義する。MultiBaas接続、ウォレット署名、Amoyへの送信はモックにする。モックは固定サンプルを返し、DB、セッション、登録結果の保存、呼出し回数に応じた状態変更を持たない。発行者CLIは後続とする。

ユーザーが選択した範囲は「署名・送信もモック」「固定サンプルだけ返す」「Web APIを先に設計」「サンプル入力に固定」。初回の成果物はこの文書とOpenAPI。その後の実装指示により、固定モックAPIを追加した。[実装と検証の記録](BACKEND_IMPLEMENTATION.md)を参照する。公開は行っていない。既存PoCには接続しない。

## 構成と責務

```text
UI --> Route Handler --> Registration Service --> MultiBaas Gateway
                                                     |
                                                 Mock Gateway

UI --> Mock Wallet --> fixed transaction hash
```

| 要素 | 責務 |
| --- | --- |
| Route Handler | JSON、パス、ヘッダーの検証、Serviceの呼出し、HTTPステータスと共通応答の生成 |
| Registration Service | カード存在、登録条件、取引と登録内容の照合。MultiBaas固有のJSONをUIへ流さない |
| MultiBaas Gateway | カード読取り、未署名取引作成、取引取得、レシート取得、登録イベント照会を共通の内部形式で返す |
| Mock Gateway | 選択されたシナリオの固定データまたは接続エラーを返す。状態を保存しない |
| Mock Wallet | 承認時に固定ハッシュ、拒否時に拒否結果を返す。実ウォレットやRPCを呼ばない |

Serviceの照合条件はモックでも省略しない。`mismatch` はGatewayの返す送信者を許可ウォレットと異なる値にし、Serviceが記録不一致と判定するシナリオとする。HTTP応答を丸ごと返すだけのモックにはしない。

Gatewayの内部操作は `readCard(cardId)`、`buildRegistrationTransaction(cardId, walletAddress, nickname)`、`getTransaction(txHash)`、`getReceipt(txHash)`、`findRegistrationEvent(cardId)` とする。存在しないカード、未取得の取引、レシート待ち、イベント待ちはそれぞれの結果で表現し、通信失敗は型の異なる接続エラーとして扱う。シナリオはリクエスト単位のGateway生成時に渡し、共有変数へ保存しない。

## 接続先と公開境界

1つのAPI配置が1つの登録コントラクトを扱う。`chainId + contractAddress + cardId` でカードを識別する。パスから渡すのはカードIDだけで、チェーンとコントラクトはサーバー設定から決める。異なる配置のカードはその配置のAPIで扱う。

全APIはウォレット未接続でも呼べる。登録準備に渡されたアドレスは本人確認の根拠ではない。今回の許可チェックはサンプルの整合性確認であり、実接続時の登録権限は署名とコントラクトが強制する。発行・所有者更新・代理署名のWeb APIは設けない。

UIとAPIは同一オリジンを前提とする。任意のMultiBaasメソッド、RPC、コントラクト、関数名を入力として受け付けない。応答には `Cache-Control: no-store` を付ける。配信側が `private`、`no-cache` などを追加する場合も `no-store` を必須とする。エラーの内部スタックやAPIキーは返さない。

実装時の環境指定は `BACKEND_MODE=mock` とする。未指定や未知の値は設定エラーにし、通信失敗から自動的にモックへ切り替えない。`live` は応答形式に予約するが、実接続Gatewayの実装・検証が済むまでは起動設定として受理しない。

## API契約

| メソッドとパス | 入力 | 成功応答のdata |
| --- | --- | --- |
| `GET /api/v1/cards/{cardId}` | カードID | カード、選手名、配置情報、登録状態、所有者、証跡 |
| `POST /api/v1/cards/{cardId}/registration/prepare` | `walletAddress`、`chainId`、`nickname` | カードID、ニックネーム、未署名取引 |
| `GET /api/v1/cards/{cardId}/transactions/{txHash}` | カードID、取引ハッシュ | 対象カードの取引確認結果 |

成功は `{ meta, data }`、失敗は `{ meta, error: { code, message } }` とする。`meta.mode` は今回は常に `mock`。UIは `error.code` から日本語・英語を選び、英語の診断用 `message` を表示文言の識別に使わない。

### 入力規約

今回の具体化として、カードIDは英数字・ハイフン・アンダースコアの1〜64文字とする。アドレスは `0x` と40桁の16進数、ハッシュは `0x` と64桁の16進数。比較前に16進部分を小文字へ正規化する。ニックネームの空白除去・Unicode正規化は行わず、固定サンプルと完全一致させる。

登録準備のJSONには3つの必須フィールドだけを許可する。ニックネームは空文字を拒否する。本文の上限は16 KiB、Content-Typeは `application/json` とする。任意のニックネームの長さ・正規化・オンチェーン制約は実接続設計で決める。ここでのサンプル制約を実サービスの名前制約に流用しない。

モックの検証順序は、形式とサイズ、シナリオ、固定カードIDの存在、接続エラーのシナリオ、カードの登録済み判定、チェーン、許可ウォレット、サンプル名とする。実接続ではカード取得に成功して初めて未発行を判定し、取得失敗は503とする。形式が正しい未知のハッシュには、カードが存在する場合に200の `unknown / TRANSACTION_NOT_SEEN` を返す。

### カードと証跡

- `unregistered`: `owner` はnull、`evidence.status` は `none`。
- `registered`: `owner` はアドレスとニックネーム。証跡は `available` または `pending`。
- `available`: 登録ハッシュとブロック番号を持つ。`pending` に未確認のハッシュを補わない。
- 未発行は404で表し、`unregistered` に含めない。カード読取りが失敗した場合は503で表す。

### 未署名取引

登録準備の応答は `chainId`、`from`、`to`、`data`、`value` を持つ。`value` はweiの10進文字列で、この操作では `"0"` に固定する。nonce、gas、手数料をAPI契約に含めず、実接続時はウォレット側で扱う。

今回の `data: "0x"` はABI未確定を示すプレースホルダーであり、実際に登録を呼ぶcalldataではない。UIは `meta.mode=mock` を見てMock Walletへ渡す。モック値から実取引やPolygonscanリンクを作らない。ABIとcalldataの生成は実接続前の必須作業である。

### 登録確認

| status | 条件 |
| --- | --- |
| `pending` | 対象の取引は取得でき、レシートがまだない |
| `confirmed` | 成功レシート、対象取引、登録イベント、カード状態の照合に成功 |
| `reverted` | 対象取引のレシートが失敗を示す |
| `unknown` | 取引を取得できない、または記録の対応が一致しない |

通信に成功して取引がない場合は `TRANSACTION_NOT_SEEN`、対応が一致しない場合は `RECORD_MISMATCH` を付ける。通信自体が失敗した場合は503とし、これらの200応答と分ける。

確認済みへ進めるには、接続先チェーンが80002、取引の宛先が設定したコントラクト、送信者が許可ウォレット、レシートのハッシュが照会対象と一致している必要がある。レシート内の対象コントラクトが出した登録イベントについて、カードID、所有者、ニックネームを照合し、カード状態とも一致させる。成功レシートだけでは確認済みにしない。対応確認前の別コントラクトの失敗取引も `reverted` と扱わず、記録不一致とする。

登録イベントの検索同期が遅れていても、照会したレシート内のイベントで照合できれば確認済みにできる。公開カードの証跡検索が追い付いていない状態は別に扱い、取得済みの所有者情報を消さない。自由入力を扱う実接続版では、UIが保持する承認内容と確認APIの結果も比較する。APIへ期待値を渡して、それ自体を証跡にする構成にはしない。

### エラー

| HTTP | code | 意味 |
| --- | --- | --- |
| 400 | `INVALID_INPUT` | パス・JSON・型が不正 |
| 400 | `INVALID_MOCK_SCENARIO` | 未知のシナリオ、操作との組合せが不正 |
| 404 | `CARD_NOT_FOUND` | 未発行カード |
| 409 | `ALREADY_REGISTERED` | 登録済みカードへの登録準備 |
| 422 | `CHAIN_MISMATCH` | Amoy以外の指定 |
| 422 | `WALLET_NOT_ALLOWED` | 許可外ウォレット |
| 422 | `MOCK_SAMPLE_UNSUPPORTED` | 固定サンプル以外の名前 |
| 413 | `PAYLOAD_TOO_LARGE` | 本文が上限を超える |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | JSON以外の本文 |
| 503 | `UPSTREAM_UNAVAILABLE` | MultiBaasの停止・タイムアウト・認証失敗・不正応答の模擬 |
| 500 | `INTERNAL_ERROR` | アプリ内部の不具合 |

外部接続の失敗は再試行可能な確認不能として扱う。読み直しても取引を自動再送しない。ログにはエラー分類と操作を残し、MultiBaasの応答本文や秘密情報をそのまま出力しない。

## 固定サンプルとシナリオ

固定値はOpenAPIの `x-mock-sample` に集約する。カードは `SK-2026-001`、選手名は「証明一郎」、ニックネームは「おじいちゃんコンビニ」。アドレス、取引ハッシュ、ブロック番号はすべて模擬値で、実ネットワーク上の記録や人物との対応を主張しない。

シナリオはリクエストの `X-Mock-Scenario` で指定し、省略時は `default`。操作ごとの対応は各APIの `x-mock-scenarios` を正本とする。

| シナリオ | カード取得 | 登録準備 | 登録確認 |
| --- | --- | --- | --- |
| `default` | 登録済み | 未登録サンプルから準備成功 | 確認済み |
| `registered` | 登録済み | 409 | 確認済み |
| `unregistered` | 未登録 | 準備成功 | 400 |
| `not-found` | 404 | 404 | 404 |
| `pending` | 400 | 400 | 確認中 |
| `reverted` | 400 | 400 | 取引失敗 |
| `unknown` | 400 | 400 | 取引未取得 |
| `evidence-pending` | 所有者あり・証跡待ち | 400 | 400 |
| `unavailable` | 503 | 503 | 503 |
| `mismatch` | 400 | 400 | 記録不一致 |

`default` は各API単体の成功例であり、共有状態ではない。登録前から一連の操作を試す場合は明示的なシナリオを使う。許可外ウォレットと別チェーンは登録準備の入力で再現する。承認拒否はMock Walletで再現し、バックエンドのシナリオには追加しない。

形式とシナリオの検証後、既知カード以外は404とする。既知カードに `not-found` を指定した場合も404とする。登録確認で既知のサンプルハッシュ以外を渡した場合、`unavailable` の503を除き `TRANSACTION_NOT_SEEN` を返す。シナリオで任意のハッシュを確認済みにしない。将来のliveモードではモックヘッダー自体を400にし、読み飛ばさない。

## UIからの呼出し順序

1. `unregistered` でカードを取得する。
2. サンプルのウォレットと名前、公開への同意を確認して登録準備を呼ぶ。同意前は呼ばない。
3. Mock Walletで承認する。拒否時はここで終了し、登録確認を開始しない。
4. 固定ハッシュで `pending`、次に `registered` を指定して登録確認を呼ぶ。この切替はテスト側が行う。
5. `registered` でカードを再取得する。

再読込や別端末からの要求も、選択したシナリオの固定データを返す。入力した名前や登録結果の共有ではない。既存UIの自由入力・タイマーによる模擬成功は独立したプロトタイプの動作であり、このAPIへ接続する際はサンプル入力と明示的なシナリオ切替に揃える。

## 実接続への移行条件

APIのパスと共通DTOを維持し、GatewayとWalletを実接続へ差し替える。MultiBaasのレスポンス形状はGateway内で変換する。サーバー側Secretに最小権限APIキーを置き、未署名取引作成では `signAndSubmit: false` を固定する。

コントラクトのABI、実アドレス、発行者、配置ブロック、MultiBaasの権限・同期、取引とレシートの実レスポンス、スマホでの署名と復帰は移行前に検証する。固定応答の試験をこれらの合格記録にはしない。実接続版での確定数・再編への対応と運用上の制限も移行設計で決める。

参照: [MultiBaasのフロントエンドと未署名取引](https://docs.curvegrid.com/multibaas/getting-started/build-a-frontend/)、[コントラクト関数API](https://docs.curvegrid.com/multibaas/api/call-contract-function/)、[取引](https://docs.curvegrid.com/multibaas/api/get-transaction/)、[レシート](https://docs.curvegrid.com/multibaas/api/get-transaction-receipt/)。2026-09-26 JSTの設計調査で確認した。実環境への接続は行っていない。

## 検証計画

| ID | 対象と期待結果 |
| --- | --- |
| B01 | 未発行IDは404。カードを自動作成しない |
| B02 | 登録済みは409、許可外ウォレット・別チェーン・サンプル外の名前は422 |
| B03 | 登録準備を繰り返しても、同じシナリオのカード取得結果が変わらない |
| B04 | シナリオを並行実行しても別要求へ影響しない |
| B05 | 取引の宛先・送信者、レシートのハッシュ・イベント発行元、カードID・所有者・名前・カード状態のいずれかが不一致なら確認済みにならない |
| B06 | 対象取引の失敗レシートだけをrevertedとする。取引未取得、レシート待ち、通信失敗と区別する |
| B07 | 証跡待ちでも取得済みの所有者を返す |
| B08 | 承認拒否後に登録確認を呼ばない。結果不明から自動再送しない |
| B09 | モックから実ウォレット・外部API・RPCへ通信しない |
| B10 | 形式・サイズ・Content-Type、不正シナリオを定義どおり拒否する |
| B11 | 全応答がOpenAPIに一致し、mockを明示する。liveにモックヘッダーを持ち込めない |

B01〜B11の実装試験と適用範囲は [実装と検証の記録](BACKEND_IMPLEMENTATION.md) に記録する。以下はOpenAPI構文、参照、サンプル、シナリオ表だけを確認する静的検証である。

再実行方法:

```sh
python3 -m venv /tmp/shomei-openapi-venv
/tmp/shomei-openapi-venv/bin/pip install -r scripts/requirements-backend-spec.txt
/tmp/shomei-openapi-venv/bin/python scripts/verify_backend_spec.py
```

## 決定の出典

- [探索の依頼](../docs/prompts/2026-09-25/140109-789742-3fa35cc7e2b54786aaaa64a589110919.json)
- [採用計画の実行指示](../docs/prompts/2026-09-25/151125-676118-d1888c4c54d2401ea99965526e42e9fb.json)
- [選択回答と採用範囲の手動記録](../docs/prompts/backend-design-decisions.md)

保存日時のJSONはUTCで2026-09-25、実行指示はJSTで2026-09-26となる。OpenSpecの初期化は確認済みだが、現在の仕様は `specs/` にある。初回の承認対象は上記設計成果物。その後の [実装指示](../docs/prompts/2026-09-25/152556-790938-5fdac443e5ab4602b26eb512cec3edb6.json) により固定モックAPIを実装した。OpenSpec changeは作成していない。
