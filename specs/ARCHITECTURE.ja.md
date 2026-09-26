[English](ARCHITECTURE.md) | 日本語

# 構成とデータの流れ

## 構成

```text
カードQR → モバイルUI → Next.js API → MultiBaas → Curvegrid Testnet
                  └→ MetaMask ──本人署名・送信──→ 公開Web3 RPC
発行者CLI ──未署名取引の作成──→ MultiBaas
          └──発行者署名・送信──→ 公開Web3 RPC
```

| 要素 | 実装と役割 |
| --- | --- |
| モバイルUI | `prototypes/mobile-ui`。JavaScript、Tailwind CSS、daisyUI。カード表示、カメラ、日英切替、ウォレット操作 |
| Web API | `apps/web`。Next.js・TypeScript。MultiBaas応答の検証、未署名取引の準備、登録結果の照合 |
| 配信 | Cloudflare Workers・OpenNext。integrationではUIを `/ui/`、APIを `/api/v1/` に配信 |
| コントラクト | `contracts/src/OwnershipRegistry.sol`。発行権限、初回登録、所有者・ニックネームの保存 |
| 発行者CLI | `contracts`。配置、MultiBaasへの紐付け、カード発行、記録の確認 |
| MultiBaas | 状態読取り、未署名取引作成、レシート・イベント取得 |
| ENS | ethers 6.17.0でSepoliaのENSv2を正引き・逆引き。登録チェーンと分離し、登録先はアドレスを正本にする |
| MetaMask | 登録者の鍵を保持し、取引を署名・送信 |

既存PoCのコード・データ・保存先には接続しない。現在のintegrationはCurvegrid Testnet、チェーンID `2017072401` を使う。配置先はAPI設定で指定し、MultiBaas・RPC・ウォレットのチェーンを照合する。

## データと権限

カードの識別子はチェーンID・コントラクトアドレス・カードIDの組。チェーンが存在、登録許可、所有者、ニックネームの正本を保持する。

発行者はコントラクト配置時に固定する。発行時の許可ウォレットがゼロアドレスなら全員許可、特定アドレスならその本人だけが登録できる。CLIの既定は全員許可。登録後は所有者・名前を変更できない。

ニックネームはUTF-8で1〜96バイト。APIは入力を正規化せず、ABI引数と送信内容の一致を確認する。ブラウザ保存値だけで登録済みとは判定しない。

## API

| 操作 | エンドポイント |
| --- | --- |
| 接続設定と状態 | `GET /api/v1/connection` |
| カードの公開情報 | `GET /api/v1/cards/{cardId}` |
| 登録用の未署名取引 | `POST /api/v1/cards/{cardId}/registration/prepare` |
| カード一覧検索 | `GET /api/v1/ens/cards?name={ENS名またはアドレス}` |
| Primary name表示 | `GET /api/v1/ens/primary-name?address={address}` |
| 登録取引の照合 | `GET /api/v1/cards/{cardId}/transactions/{hash}` |

本文・応答・エラーの定義は [openapi.yaml](openapi.yaml)。未発行は404、入力不正は400/413/422、設定・上流障害は503。残高不足が確認できた場合は422 `INSUFFICIENT_FUNDS` を返す。

## 登録の流れ

1. カードと接続設定をAPIから取得する。
2. 本人のウォレットへ接続し、必要なネットワーク追加・切替を行う。
3. 公開内容への同意後、APIがMultiBaasで未署名取引を作成する。
4. APIとUIがチェーン・送信元・送信先・value・カードID・名前を検証する。
5. MetaMaskが署名し、公開Web3 RPCへ送信する。
6. APIが取引、レシート、登録イベント、現在の所有者・名前を照合する。

iPhone/iPadの外部ブラウザからは `metamask://dapp/<公開URL>?cardId=...` でMetaMask内ブラウザへ移る。注入providerがあればその場で接続し、なければMetaMask Connectを使う。SDK初回接続では対象チェーンを強制せず、接続後に追加・切替する。

送信結果はカード・チェーン・コントラクト単位で保存する。別タブや連打の重複送信を防ぎ、再表示では既存取引の照会だけを再開する。最終的な二重登録の拒否はコントラクトが担う。

## 状態と再取得

接続準備、登録取引、証跡再取得を別々に管理する。接続準備中の画面更新ではカードと入力欄を保持する。登録後の再取得ではステータス欄だけを更新する。

初回登録は最大60秒の照合を行う。取引成功と所有者が一致し、イベント検索の反映だけが遅れている場合は、登録完了と証跡待ちを分けて表示する。通信失敗を未登録や成功に変換しない。

## カメラ

`qr-scanner` が端末内で動画・写真を解析する。デコーダーworkerは同一配信元にバンドルする。実カメラ時だけカメラ権限と必要なblobを許可する。画面離脱・ページ非表示・読取り完了でストリームを停止する。[カメラ仕様](CAMERA_SCAN.md)。

## モードと秘密情報

`UI_API_MODE`、`UI_WALLET_MODE`、`UI_CAMERA_MODE` はビルド時に指定する。APIの `BACKEND_MODE` は実行時設定。UIモックとintegrationは別Workerに配置する。

MultiBaasのアプリ用キーはCloudflare Secretへ保存する。管理キーと発行者の署名鍵はCLI側だけで扱う。登録者の鍵はMetaMaskから取得しない。公開Web3 RPCはウォレット接続用の公開設定で、管理APIキーを流用しない。

CORSは許可したOriginだけに付与する。上流のエラー本文や認証値を公開せず、エラーコードと受付IDで診断する。

設定・ビルド・運用は [CURVEGRID_INTEGRATION_RUNBOOK.md](CURVEGRID_INTEGRATION_RUNBOOK.md)、コントラクトとCLIは [contracts/README.md](../contracts/README.md) を参照する。

## ENSの読み取りとカード検索

ENS名はSepoliaで解決し、Curvegrid Testnetの`CardRegistered`イベントをownerで絞る。1範囲は最大2,000ブロック、1回は最大4範囲・20件。取引・レシート・現在のカード状態を照合して一覧を返す。カーソルは検索名・アドレス・レジストリ・基準ブロックhashを保持し、参照先や基準hashが変わった場合は再検索させる。アドレス入力はENS解決を省略する。

登録画面の逆引きは任意の表示補助。正引き一致時だけ表示し、失敗時はnullで返す。アカウント変更時は前の表示を即座に消し、古いリクエストの応答を破棄する。APIキーとENS RPC設定はWorkerの実行時Secretに置き、ブラウザへ渡さない。CCIP/RPCのHTTPリダイレクトはmanualで受けて3xxを拒否する。

新規カードは `allowedWallet` をゼロアドレスとして発行し、登録先を限定しない。ENSは検索・名前表示にのみ使用する。現行CLIの旧 `--recipient-ens` / `--wallet` 指定は削除予定で、今回の仕様更新ではコードを変更していない。既発行カードの制限や署名済み取引を書き換えず、過去の状態ファイルは照合用に保持する。カード別サブネーム、新規Registry/Resolver、永続検索インデックスは追加しない。[詳細](ENS_INTEGRATION.md)。
