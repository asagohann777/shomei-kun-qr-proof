# Curvegrid Testnet連携の詳細設計

2026-09-26訂正: デモの登録許可は全員。CLI省略時はallowedWallet=0で発行し、任意の本人ウォレットが初回登録できる。以下の指定許可ウォレットに関する記述は、非ゼロを指定した限定カードのみを指す。最新の配置・検証は [全員登録計画](OPEN_REGISTRATION_DEMO.md) を参照。

状態: **実装済み・実環境の接続確認待ち。** 2026-09-26 JST。承認対象は `453387e`。リベース後の同一設計は `b537e04`。承認の出典は [変更記録](HACKATHON_CHANGES.md) を参照。

[計画](CURVEGRID_INTEGRATION_PLAN.md) / [Draft PR #1](https://github.com/asagohann777/shomei-kun-qr-proof/pull/1) / [既存モック設計](BACKEND_DESIGN.md)

## 1. レビュー対象と設計時点の現状

ユーザーが決めたのは、Curvegrid Testnet、実際の登録・書込み、新規の所有者登録コントラクト、自由入力のニックネーム、通常ブラウザからMetaMaskへの接続、API・コントラクト・CLIとUIの担当分離である。本書のABI、設定名、エラー、制限値、CLI操作はこれらを具体化した提案で、設計承認まで確定扱いにしない。

| 項目 | 現状 | 本設計の差分 |
| --- | --- | --- |
| Web API | Next.js、固定mockのみ。3 API実装済み | パスを保ち、liveと接続確認を追加 |
| チェーン | DTOとServiceに80002・固定サンプル参照 | mockの80002を維持し、liveは配置設定を参照 |
| 所有者登録 | サンプル名、模擬取引のみ | 実際の許可ウォレット、自由入力、ABIで生成された取引 |
| コントラクト・CLI | 未実装 | Solidity、配置・発行・読取りCLI |
| UI | 独立した静的モック | UI担当が画面とMetaMask Connectを実装 |
| 公開 | UIモックだけ公開済み | バックエンドを別Workerへ配置する。今回は公開しない |

`specs/SPEC.md` と `specs/ARCHITECTURE.md` のAmoyは最終目標として残す。本changeは先行するCurvegrid Testnet検証を定義する。既存F01〜F10・A01〜A11全部の達成を意味せず、とくにA07の無資格・独立公開RPC照合は対象外。

## 2. 担当とモジュール境界

```text
UI担当: スマホ画面 / MetaMask Connect / 再読込後の追跡
    | 公開API                           | 署名・送信
Next.js Route Handler                  MetaMask --> Curvegrid Web3 RPC
    |
Registration Service --> RegistrationGateway
                             | mock: 現在の固定応答
                             | live: MultiBaas REST API --> Curvegrid Testnet

ローカル発行者CLI --> MultiBaas管理・取引作成 / ローカル署名 --> Web3 RPC
```

バックエンド担当は `apps/web/src/backend/`、API Route Handler、OpenAPI、コントラクト、CLI、Workers構成を所有する。UI担当はページ、コンポーネント、CSS、翻訳、ブラウザ側のウォレット・追跡処理を所有する。APIへの接続例とABI成果物を引き渡す。共通のpackage/lockfile変更はバックエンドの基盤追加後にUI担当が取り込み、同一ファイルの同時編集を避ける。

- `config`: 環境設定をmock/liveの判別可能な型へ変換する。リクエスト本文で接続先を選ばない。
- `http`: パス・JSON・Origin・ヘッダー検証、共通応答、例外の秘匿化。
- `service`: 登録条件と取引の対応を照合する。固定sampleをliveの判定に流用しない。
- `multibaas-gateway`: REST呼出し、応答の実行時検証、ABIに基づく内部型への変換。
- 既存Mock GatewayとMock Walletはmock専用として維持する。実ウォレットSDKはUI側に置く。

内部Gatewayの `registry` に加え、接続状態、ブロック、取引input、レシートblockHash/raw logsを扱える型を設計する。外部JSONは境界で検証し、不正応答を503へ変換する。公開DTOはOpenAPIから生成し、Workers用の検証関数は現在と同様に事前生成する。

## 3. 設定と信頼境界

| 設定 | 保管先・用途 |
| --- | --- |
| `BACKEND_MODE` | `mock` または `live`。未指定・未知値は設定エラー |
| `MULTIBAAS_BASE_URL` | サーバー設定。HTTPSのデプロイメントURL、`/api/v0`まで指定 |
| `MULTIBAAS_API_KEY` | Cloudflare Secret。読取りと未署名取引作成だけのアプリ用キー |
| `CHAIN_ID` | liveの期待する数値ID。MultiBaas環境から確認した値を設定し、80002を流用しない |
| `REGISTRY_ADDRESS` / `REGISTRY_CONTRACT_LABEL` / `REGISTRY_CONTRACT_VERSION` | 固定した配置先とMultiBaas LibraryのABI定義 |
| `REGISTRY_DEPLOYMENT_BLOCK` / `REGISTRY_ISSUER` | イベント開始ブロックと期待する発行者 |
| `CURVEGRID_PUBLIC_WEB3_RPC_URL` | ウォレット配布用の専用公開Web3キーで作ったHTTPS RPC URL |
| `ALLOWED_UI_ORIGINS` | カンマ区切りの完全一致Origin。空なら同一Originのみ許可 |
| `PUBLIC_API_ORIGIN` | このAPI自身のHTTPS Origin。ローカル開発だけlocalhostのHTTPを許可 |

Curvegrid Testnetのchain ID、RPC URL、コントラクト、発行者、MultiBaasラベルの実値は未取得。ユーザーの作成済み環境に設定する値であり、架空値を補って接続成功にしない。

`BACKEND_MODE=live` だけが設定され、接続値が不足している場合、Worker自体は起動可能にして接続確認APIが不足項目名を返す。カード・登録APIは503で停止する。ビルド時にSecretを要求しない。mock/liveのモード指定そのものの不足や未知値は引き続き設定エラーにする。live設定の一部欠落をmockで補わない。

公開Web3 RPC URLはブラウザ・MetaMaskへ渡る設定として扱う。MultiBaasの「public Web3 key」で発行した専用URLだけを使い、管理APIキーをURLやブラウザへ出さない。APIキーとRPC URL全体を診断ログへ出さない。CLIの管理キーと発行者鍵はCloudflareへ設定しない。

CORSはOrigin完全一致。許可Originへだけ `Access-Control-Allow-Origin` と `Vary: Origin` を付ける。Cookie/credentialsは使わない。OPTIONSはGET/POSTとContent-Typeを許可し204。OriginなしのCLI要求は受理し、未許可・`null` Originは403。CORSを本人認証とは扱わない。実際の登録権限はコントラクトで強制する。

## 4. 公開API契約

既存の成功 `{meta:{mode},data}` とエラー `{meta:{mode},error:{code,message}}` を維持する。`message` は診断用の英語。UIはcodeと状態から日英文言を選ぶ。全応答に `Cache-Control: no-store` を必須とし、配信側の追加指定を許容する。

| API | liveの処理 |
| --- | --- |
| `GET /api/v1/connection` | 設定、MultiBaas認証、チェーン、最新ブロック、RPC、コントラクトを順に確認 |
| `GET /api/v1/cards/{cardId}` | コントラクトのカード状態と登録証跡を取得。未接続の第三者も利用可能 |
| `POST /api/v1/cards/{cardId}/registration/prepare` | 登録条件を確認し、MultiBaasから未署名register取引を取得 |
| `GET /api/v1/cards/{cardId}/transactions/{txHash}` | 取引・レシート・イベント・現在の登録内容を照合 |

liveでは `X-Mock-Scenario` が存在したら400 `INVALID_MOCK_SCENARIO`。既存mockのliveヘッダー拒否試験はこのコードへ揃える。mockの3 API、固定値、19シナリオは維持する。接続APIのmock応答は `mode:mock` を明示し、`status:"mock"` と固定registryだけを返す。実接続のready状態に見せない。

### 接続確認

設定不足は503 `CONFIGURATION_MISSING`。このコードに限り `error.details` を `{missingSettings: string[]}` として追加し、値は返さない。それ以外のエラーは既存のcode/message形式を使う。詳細フィールドはOpenAPIでコード別のunionとして定義する。

成功時のdataは次の構造とする。値は設定・実取得値で埋め、mock用の値を混ぜない。

```text
{
  status: "ready",
  network: {
    name: "Curvegrid Testnet", chainId: number,
    nativeCurrency: {name: "Ether", symbol: "ETH", decimals: 18},
    rpcUrls: [publicWeb3RpcUrl]
  },
  registry: {chainId, contractAddress, issuer},
  latestBlock: {number: number, hash: string},
  nicknameMaxUtf8Bytes: 96
}
```

MultiBaasのchain ID、RPCの `eth_chainId`、期待設定を比較する。MultiBaasにリンクしたaddress/ABI version、RPCの `eth_getCode`、コントラクトの `issuer()` / `schemaVersion()` を確認する。期待するABIだけを使用し、リクエストで任意の関数を受け付けない。readyはその時点の疎通成功で、未接続のMetaMaskや将来の取引成功を保証しない。登録準備でもチェーンと配置先の対応を確認する。

### カードと登録準備

既存の `cardId` の英数字・`_`・`-`、1〜64文字を維持する。住所・ハッシュの形式も維持し、16進値だけを小文字へ正規化する。カード名は今回「証明一郎」のアプリ側表示値とし、別選手・画像管理のAPIは追加しない。

登録準備の必須JSONは `walletAddress`、`chainId`、`nickname` の3フィールドだけ。本文上限は既存どおり16 KiB。自由入力はliveだけに導入し、UTF-8で1〜96バイト、空白除去・Unicode正規化なしとする。JSONの孤立サロゲートを400にし、エンコード時の置換文字による変化を防ぐ。OpenAPIにliveのUTF-8制約を記載し、バイト長とUnicodeの妥当性はHTTP境界で検証する。mockの既存入力契約は維持する。

形式・サイズ、liveのシナリオヘッダー、設定、上流取得、未発行、登録済み、チェーン、許可ウォレットの順で判定する。サーバーでのアドレス一致は取引準備の条件であり、本人確認済みとはしない。

返す取引は既存形式の `{chainId,from,to,data,value:"0"}`。nonce/gas/手数料は含めずMetaMask側に委ねる。ABIでcalldataをdecodeし、`register(cardId,nickname)`、from、to、chainId、valueを検証してから返す。liveでは `data:"0x"` を拒否する。準備要求は一切送信しない。

APIに入力した名前が登録結果と同じであることをUIも照合する。APIへクライアントの期待値を渡して、それ自体をチェーン証拠にする処理は作らない。

### エラー

既存400/404/409/413/415/422/500/503を維持し、次を追加する。mockの既存エラー応答は変更しない。

| HTTP・code | 条件 |
| --- | --- |
| 400 `INVALID_INPUT` | liveの名前が空・96バイト超過・不正なUnicodeを含む場合も含む |
| 403 `ORIGIN_NOT_ALLOWED` | 許可されていないOrigin |
| 503 `CONFIGURATION_MISSING` | live設定が不足。項目名だけを追加情報に含める |
| 503 `CONNECTION_MISMATCH` | チェーン・配置先・発行者・schemaVersionが設定と一致しない |
| 503 `MULTIBAAS_AUTH_FAILED` | 上流の401/403。利用者のウォレット認証失敗とは表示しない |
| 503 `UPSTREAM_TIMEOUT` | 上流呼出しの時間切れ |
| 503 `UPSTREAM_UNAVAILABLE` | ネットワーク、429/5xx、不明な404、JSON/ABI不正など |

GET connectionの例: 未設定なら503とmissingSettings、認証失敗なら503 MULTIBAAS_AUTH_FAILED、設定した別チェーンへ接続した場合は503 CONNECTION_MISMATCH。成功と通信障害を200の同じ状態で表さない。

## 5. MultiBaas Gateway

ブラウザからMultiBaas管理RESTを直接呼ばない。WorkerのfetchでベースURLと固定パスを組み立て、Bearerキーを付ける。fetchのredirectはmanualにし、3xxを上流エラーとして拒否する。1回の上流呼出しは10秒、1 API全体は30秒で打ち切り、自動再送・自動リトライは行わない。ログには操作・エラー分類・サービス種別・HTTP status・例外名だけを残す。

| Gateway操作 | API・変換方針 |
| --- | --- |
| 接続状態 | `GET /chains/ethereum/status` の `result.chainID` とblockNumber |
| 最新・特定ブロック | `GET /chains/ethereum/blocks/{block}`。`latest`または番号を指定 |
| readCard / issuer / schemaVersion | `POST /chains/ethereum/addresses/{address}/contracts/{label}/methods/{method}` の参照関数。実行先と関数は固定 |
| buildRegistrationTransaction | 同じ関数APIへ `register` とargs/from/`signAndSubmit:false` を渡す |
| getTransaction | `GET /chains/ethereum/transactions/{hash}`。hash、chain、from、to、inputを内部型に変換 |
| getReceipt | `GET /chains/ethereum/transactions/receipt/{hash}`。status、hash、blockHash、blockNumber、raw logsを検証 |
| findRegistrationEvent | `GET /events` をcontract_address・event_signatureで絞り、ページ内のcardKey/cardIdを照合。配置ブロック以前を除外する |

応答ラッパー `{status,message,result}` を検証する。未署名取引は `result.tx` と `submitted:false` を要求する。txにchainIdフィールドは定義されていないため、検証したMultiBaasのchainIDから公開取引のchainIdを設定する。取引取得は `result.data.input`、`result.from`、`result.isPending` を使う。isPending=trueの対象取引はreceiptの404を待たずpendingにできる。

SDKの広い型をそのまま内部へ渡さない。十進/0x数量はパーサーを分け、chain IDとブロック番号は安全な整数だけを受理する。金額は10進文字列、calldataとログは0xバイト列とする。レシートのstatusは成功1・失敗0だけを受理する。

MultiBaasは参照関数の `result.output` を任意型として定義している。`getCard` は後述の5項目を返すABIに固定し、配列ならABI順、オブジェクトならABI出力名による形だけを厳密に変換する。boolを文字列からtruthy判定したり、名前をJSON.stringifyで補わない。実環境で取得した応答を秘匿化してfixture化し、追加形式が必要ならAdapterの設計を改訂する。不明形式を推測で受理しない。

MultiBaasの一般的な404は、未発行カードや未取得取引と同じ意味ではない。カード未発行は `getCard` の正常応答 `exists=false` だけで判断する。取引不存在を明示する正常応答・確認済みの上流エラー仕様がない場合は503にする。実環境の404を無条件で200 unknownやpendingに変えない。

イベント一覧にcardId専用のフィルターはない。`contract_address` と `event_signature` を指定し、limit=10とoffsetで最大10ページを読む。カードキーは取得後に検証する。上限か時間切れまでに探索を完了できなければ503にし、未登録や証跡なしと断定しない。イベント内の取引hashは `transaction.txHash` を使う。

公開カードのownerはコントラクト状態から取得する。登録証跡はイベント検索で候補を得たあと、その取引レシートのログと状態を照合して返す。正常な検索結果が空なら `evidence:pending` としてownerを保持する。検索通信が失敗した場合は503。配置先・カードが違う候補を登録証跡にしない。

## 6. 取引照合と復帰

取引のchain ID、hash、from、toに加え、inputをABIでdecodeして関数とカードIDを確認する。該当カードへのregister取引であると確認できる前に、pendingやrevertedと判定しない。

| 条件 | 公開結果 |
| --- | --- |
| 通信成功と確認済みの仕様で取引不存在を判断できた | unknown / TRANSACTION_NOT_SEEN |
| 対象のregister取引で `isPending=true`、または確認済みの上流仕様でレシート待ちと判断できた | pending |
| 対象のregister取引で失敗レシートを確認 | reverted |
| 成功レシート、正しいイベント、カード状態が一致 | confirmed |
| 別カード、関数、送信者、宛先、ログ、名前などの対応が不一致 | unknown / RECORD_MISMATCH |
| API/RPC通信自体が失敗 | 503。unknownに置き換えない |

confirmedではraw logsをローカルABIでdecodeし、emitter、cardKey、cardId、owner、nickname、取引・ブロックを照合する。関数inputの名前とイベント・現在状態の名前も同じであることを求める。ブロック番号から取得したblockHashとレシートのblockHashを比較し、現在の正規ブロック上の1確認を基準とする。最終確定や将来の再編がないことを保証する表現は使わない。再照会で対応が失われたら確認不能に戻せる契約とする。

イベントインデックスが遅れていても、照会したレシート内ログで確認できればconfirmedにする。取引の再確認から送信APIを呼ばない。サーバーは登録セッション・取引のDBを持たず、API要求だけで再照合する。

UI担当への引渡し条件:

1. 接続APIのreadyと実アカウント・chain IDを確認し、公開同意後にprepareを呼ぶ。
2. prepare応答のmodeがliveであることとABI・カード・名前・宛先・valueを確認し、送信直前にアカウント/チェーンを再取得する。
3. MetaMaskへ署名・送信を依頼する。拒否後は確認を開始しない。
4. hashが得られたら `{chainId,contractAddress,cardId,txHash,nickname}` を端末に保持し、照会する。確認用APIの公開DTOは保存内容を証拠にしない。
5. 再読込・アプリ復帰は照会だけを再開する。hashが返る前に接続が失われた場合は「送信結果不明」とし、自動再送しない。MetaMaskの履歴からhashを取得して再確認する手順を渡す。

MetaMask Connect EVMの導入、状態表示、端末保存、実機試験のブラウザ操作はUI担当が実装する。本PRはこれらのコードを追加しない。

## 7. コントラクト

SolidityとHardhatを使い、コンパイル対象EVMはParisに固定する案とする。Curvegridの最新EVM機能対応を仮定しない。最終採用バージョンは実装時に互換条件を確認してlockfileとコンパイラ設定へ固定する。

```text
constructor(address issuer_)
issuer() -> address
schemaVersion() -> uint256  // 1
issue(string cardId, address allowedWallet)
register(string cardId, string nickname)
getCard(string cardId) -> (bool exists, address allowedWallet,
                          bool registered, address owner, string nickname)
CardIssued(bytes32 indexed cardKey, string cardId, address indexed allowedWallet)
CardRegistered(bytes32 indexed cardKey, string cardId,
               address indexed owner, string nickname)
```

`cardKey = keccak256(bytes(cardId))` をmappingキーとする。カードIDの元文字列はイベントに残す。Cardはexists、allowedWallet、owner、nicknameを保持し、registeredはowner != address(0)から導出する。issuerはimmutableで、ゼロアドレスを拒否する。管理者の変更、proxy、upgrade、転送、削除、任意外部呼出しは持たない。

issueはmsg.sender == issuer、IDがASCII英数字/`_`/`-`の1〜64バイト、未発行、allowedWallet != 0を要求する。発行後の許可ウォレット変更も拒否する。発行は登録完了ではない。

registerはカードの存在、未登録、msg.sender == allowedWallet、名前のバイト長1〜96を要求する。ownerとnicknameを同じ取引で保存してイベントを出す。nonpayableとし、送金を受けない。コントラクトの名前制約はバイト長であり、実名・唯一性・Unicode正規化を保証しない。APIのUTF-8境界検証をコントラクトが代行したとは扱わない。

`getCard` の未発行は `(false,0,false,0,"")`。二重登録はコントラクト側でも拒否し、APIの事前確認と送信の間に状態が変わっても最後の書込みで上書きしない。custom errorは UnauthorizedIssuer、InvalidCardId、InvalidWallet、CardAlreadyIssued、CardNotFound、AlreadyRegistered、WalletNotAllowed、InvalidNicknameLength とする。

## 8. 発行者CLIと再実行

CLIはNode.js/TypeScript、ローカル署名とABI処理にethersを使用する。コントラクトのコンパイル・ローカル試験はHardhat。ブラウザの署名ライブラリはUI担当の選定に委ね、EIP-1193と公開取引形式で接続する。

| コマンド | 動作 |
| --- | --- |
| `issuer deploy --state <file> --keystore <file>` | コンパイル済みABI/bytecodeをMultiBaas Libraryへ登録し、未署名配置取引を作成。ローカル署名・送信後にreceiptと配置先を確認し、ABIリンク・イベント同期設定を行う |
| `issuer issue --card-id <id> --wallet <address> --state <file> --keystore <file>` | 既発行状態を読み、未署名issueをMultiBaasで作成して照合。ローカル署名・送信・確認後に公開確認用API URLを出力 |
| `issuer show --card-id <id>` | MultiBaas経由で状態を表示。署名鍵は不要 |
| `issuer resume --state <file>` | 同じ記録の取引を確認し、配置後リンクなどの未完了処理を再開。別取引を自動生成しない |

Library登録は `POST /contracts/{label}` に `label,contractName,version,rawAbi,bin` を送る。rawAbiはABI JSONの文字列。配置は `POST /contracts/{label}/{version}/deploy` にconstructor引数、from、signAndSubmit:falseを渡す。receiptのcontractAddressを正として配置成功を判断し、API応答の任意フィールドdeployAtだけに依存しない。リンクは `POST /chains/ethereum/addresses/{address}/contracts` にlabel/version/startingBlockを送る。startingBlockは配置receiptの数値を10進文字列にし、再開時にlatestへ置換しない。

CLIは別の `MULTIBAAS_ADMIN_API_KEY` と `ISSUER_KEYSTORE_PATH` を使う。復号パスワードは非表示の対話入力。鍵・パスワードをargvや出力、PRへ残さない。発行者と登録者の鍵を兼用する前提にしない。Web APIにissue/deploy操作を追加しない。

署名前にRPCのchain IDと発行者アドレスを照合し、pending nonce、gas見積り、手数料を取得する。baseFee対応時はEIP-1559、それ以外はlegacyの手数料を使う。deployではbytecodeとconstructor引数、issueでは宛先・関数・引数・valueをローカルABIで照合する。照合や見積りが失敗したら署名・送信しない。確定したnonceと手数料を含む同一取引だけを再送対象にする。

stateファイルはGit管理外、0600権限とし、chain、issuer、コントラクト/bytecode hash、引数、nonce、署名済みraw tx、そのhash、工程を保存する。秘密鍵は保存しないが、署名済み取引は再送可能なため公開しない。送信前に原子的に保存し、同じstateへの並行操作は排他ファイルで拒否する。

resumeは最初に既存hashを照会する。見つからないと正常確認できた場合だけ、明示的な `--rebroadcast` で同一raw txを再送できる。通信失敗だけで再送しない。nonceが別取引に使用されていたら要確認として停止する。中断後に新しいstateへ自動退避しない。

同じcardIdが既発行の場合、許可ウォレットが一致すれば取引を送らず既存状態を表示する。不一致なら失敗。Libraryの同じlabel/versionでABI/bytecodeが一致すれば再利用し、不一致なら上書きせず停止する。リンクでは配置ブロックを `startingBlock` に必ず設定し、イベント同期を有効にする。配置先の実値は成功後に出力し、環境設定へ反映する。

## 9. 配置、並行開発、移行

Worker名は `shomei-kun-integration`。既存 `shomei-kun-ui-mock` と `shomei-kun-api-mock` の設定を上書きしない。専用Wrangler設定を追加して明示的に選び、self-referenceも同じWorker名へ向ける。Next.jsとOpenNextは現在の構成を使い、R2/D1は追加しない。

現在のOpenAPIを直接変更するのは設計承認後。まず共通DTO・fixture・ABIを更新し、UI担当へ契約変更を知らせる。その後Gateway・Service・CLIを実装する。既存mockは引き続きローカルと既存設定で試せる状態を保つ。

liveのchainIdは正の安全な整数へ一般化し、値そのものは配置設定で制約する。meta.mode、未登録/登録済み、証跡none/pending/available、取引pending/confirmed/reverted/unknownは維持する。新しい接続応答とエラーだけを追加し、生成型・validator・契約試験を同じ変更で更新する。

別OriginのUIは、UI担当がAPI base URLを設定する。API担当は実際のUI Originを許可リストに設定する。ワイルドカードCORSや任意RPCの中継を作らない。URLが未定でもAPIコードを設計でき、実値は配置時の設定項目として扱う。

設計承認後の公開手順は、ローカル試験、コントラクト配置、権限・設定確認、Worker公開、実API読取り、本人署名による登録、別端末読取りの順。APIキー未設定やスマホ未検証の段階を「実疎通済み」としない。今回のPR更新ではデプロイしない。

Workerの問題は前バージョンへ戻す。チェーン上の登録はロールバックしない。コントラクト変更が必要なら別配置と新しいカードIDで検証し、既存記録を消さない。Amoy移行も別配置として扱い、Curvegridの記録が自動移行するとは説明しない。

## 10. 試験と受け入れ条件

以下は未実施の試験計画。既存モック試験が通った事実と、新しい実接続試験を分ける。

| ID | 試験・期待結果 | 実行環境 |
| --- | --- | --- |
| C01 | mockの既存3 API・19シナリオ・固定値が変わらない。liveでモックヘッダー拒否 | Node / Next.js / Workers |
| C02 | 設定不足、管理REST認証拒否、違うchain、違う配置先を成功にしない。Secretを応答・ログへ出さない | 契約試験 + 設定後の実環境 |
| C03 | 許可Origin・同一Origin・Originなし・拒否OriginとOPTIONS。エラーにもno-store | HTTP |
| C04 | 未発行404、上流404は503、登録済み409、別wallet/chain422、自由入力の1/96/97バイト・日本語・孤立サロゲート | API |
| C05 | 発行権限、ゼロaddress、ID不正、重複発行、未発行登録、別wallet、再登録、同時競合、名前長 | ローカルEVM |
| C06 | register calldata、from/to/chain/valueの改変を準備または確認で拒否 | Gateway / Service |
| C07 | 別card/owner/name/log、失敗receipt、未取得、通信失敗、blockHash不一致を区別 | Gateway / Service |
| C08 | イベント検索が空でもowner保持。検索通信失敗は503。receiptだけで照合可能 | Gateway / Service |
| C09 | 配置・リンクの中断、同一stateの再開、同一cardの再発行、異なる引数、並行CLIを試験。新しい取引を勝手に送らない | ローカル + 設定後の実環境 |
| C10 | 設定後のGET connection、カード取得、実取引登録、再読込・未接続の別端末読取りが一致 | Curvegrid Testnet |
| C11 | 通常ブラウザ→MetaMask→復帰、拒否、アカウント/chain切替、hash取得前の切断、送信後再照会、自動再送なし | UI担当とのスマホ結合試験 |
| C12 | 320/390px・PC幅、日英、表示崩れとコンソールエラーを確認 | UI担当 |

C10/C11の実測記録にはchain ID、contract、cardId、登録hash、block、使用端末、確認日時を残す。APIキーや署名済みraw txは含めない。F/A要件への適用範囲を記録し、A07の公開チェーン照合は未達のままにする。

## 11. レビューの確認項目

- 自由入力の1〜96 UTF-8バイトと文字列を変えない方針。
- 発行者固定・許可変更なし・一度限りの登録ABI。
- 別URLのAPI、接続確認応答、エラー、CORS、公開Web3設定をUIへ渡す境界。
- ローカル暗号化キーストア、再開用state、配置・発行CLIの操作。
- 既存mock互換性と、ユーザー承認後にだけ実装・実接続検証へ進む手順。

承認済みのPRコミットSHAとユーザーの確認への参照は変更記録に保存した。OpenSpecのartifactが揃っていても承認済みにしない。

## 12. 根拠と未取得の環境情報

公式資料から確認したAPIの使い方と、接続していない実環境の事実を分ける。MultiBaasのURL、キー、実ABI応答、RPC、chain ID、権限、同期状態、スマホ動作は未確認。後から設定・取得する値であり、設計の成功例ではない。

- [Curvegrid TestnetのWeb3設定とFaucet](https://docs.curvegrid.com/multibaas/networks/curvegrid-testnet/)
- [管理APIキーと公開Web3キー](https://docs.curvegrid.com/multibaas/api-keys/)
- [未署名取引とブラウザ署名](https://docs.curvegrid.com/multibaas/getting-started/build-a-frontend/)
- [MultiBaas TypeScript SDKのChains API](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/ChainsApi.md)
- [コントラクト管理](https://docs.curvegrid.com/multibaas/manage-contracts/)
- [MetaMask Connect EVM](https://docs.metamask.io/metamask-connect/evm/)
- [関数引数と未署名取引](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/PostMethodArgs.md)
- [未署名txのフィールド](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/TransactionToSignTx.md)
- [参照関数のoutput](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/MethodCallResponse.md)
- [取引とisPending](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/TransactionData.md)
- [イベント一覧](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/EventsApi.md)
- [Library登録](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/BaseContract.md)
- [リンクと開始ブロック](https://github.com/curvegrid/multibaas-sdk-typescript/blob/main/docs/LinkAddressContractRequest.md)
- [会話の選択と出典](../docs/prompts/curvegrid-integration-decisions.md)

## 13. 実装への参照

[起動・UI接続手順](CURVEGRID_INTEGRATION_RUNBOOK.md)、[SolidityとCLI](../contracts/README.md)、[OpenAPI](openapi.yaml) を参照。ABIはコンパイル成果物をAPIとCLIで共有する。MultiBaasのABIリンクはaddress取得のcontractsで確認し、Libraryのラベル・バージョンとABIも照合する。

本書のC10/C11/C12は実環境・UI担当との結合確認として残る。ローカル試験を実疎通の実績には数えない。
