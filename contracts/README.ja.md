[English](README.md) | 日本語

# 所有者登録コントラクトと発行者CLI

発行者がカードIDと許可ウォレットを発行し、許可された本人が一度だけ所有者登録する。発行者の変更、登録後の上書き、移転、削除は提供しない。登録者の署名はUI担当のMetaMask連携で行う。

## ローカル検証

Node.js 22を使用する。CLIの端末操作試験はPython 3の標準ライブラリ `pty` も使用する。

```sh
cd contracts
npm ci
npm run compile
npm run check:abi
npm run typecheck
npm test
npm run issuer -- --help
```

Solidity 0.8.30、Hardhat 2.29.1、EVM Parisに固定。コンパイラはnpmで固定したローカルsolcを使う。`abi/OwnershipRegistry.json` はABI・配置bytecode・runtime bytecodeを含む生成成果物。`check:abi` は再コンパイル結果と一致することを検証する。

テストはローカルHardhat EVMで権限、ID、名前長、同時登録、CLIの送信前保存・中断・再開を検証する。MultiBaasのHTTP試験は仕様に基づくfixtureであり、Curvegridへの接続実績ではない。実接続の応答形式と権限は別途検証する。

## 発行者の設定

以下を環境変数で設定する。`.env` は自動読込みしない。APIキー・復号パスワードをコマンド履歴やGitへ保存しない。

| 変数 | 値 |
| --- | --- |
| `MULTIBAAS_BASE_URL` | HTTPSの管理API URL。末尾は `/api/v0` |
| `MULTIBAAS_ADMIN_API_KEY` | Library登録、配置準備、リンク、参照、issue準備の権限を持つ管理キー |
| `CURVEGRID_PUBLIC_WEB3_RPC_URL` | 対象チェーンの公開用Web3 RPC |
| `CHAIN_ID` | 実際のチェーンID |
| `REGISTRY_ISSUER` | ローカルキーストアの発行者アドレス |
| `REGISTRY_CONTRACT_LABEL` | MultiBaas Libraryのラベル |
| `REGISTRY_CONTRACT_VERSION` | Libraryのバージョン |
| `REGISTRY_ADDRESS` | 配置結果のコントラクトアドレス。issue/showで必要 |
| `PUBLIC_API_ORIGIN` | 公開確認APIのOrigin |
| `ISSUER_KEYSTORE_PATH` | 暗号化JSONキーストアの場所。`--keystore`でも指定可 |

キーストアは本人が管理する暗号化Ethereum JSONキーストアを使用する。復号パスワードは端末で非表示入力する。秘密鍵の生成・取得・保管はこのCLIの機能ではない。

## 配置と発行

以下は実際にチェーンへ書き込む操作。設定と配置許可を確認した担当者が実行する。

```sh
mkdir -m 700 .issuer-state
npm run issuer -- deploy --state .issuer-state/deploy.json --keystore /secure/issuer.keystore.json
```

`pending` の場合は同じstateで確認を続ける。`complete` に含まれるcontractを `REGISTRY_ADDRESS` に設定する。ABIリンクの開始ブロックは元の配置receiptから取得する。

```sh
npm run issuer -- resume --state .issuer-state/deploy.json
npm run issuer -- issue --card-id demo-001 --wallet 0x1111111111111111111111111111111111111111 --state .issuer-state/demo-001.json --keystore /secure/issuer.keystore.json
npm run issuer -- show --card-id demo-001
npm run issuer -- resume --state .issuer-state/demo-001.json
```

`issue` のwalletは実際の登録許可先に置き換える。既発行で許可先が同じなら新しい取引を送らず `already-issued` を返す。異なる許可先には変更できない。返却するcardUrlは確認API URLで、UIのQRリンクではない。

## 中断からの再開

署名前にチェーン、発行者、calldata、宛先、送金額を照合する。RPCからnonce、gas、手数料を取得し、署名済み取引を0600のstateへ原子的に保存してから送信する。

stateには秘密鍵を含めない。ただし署名済み取引を再送できるため、公開してはならない。`.issuer-state/` はGit管理外。stateを移す場合も同等のアクセス制限を保つ。

`resume` は同じhashを照会する。配置済みならABIリンクを再開する。正常な照会で取引が見つからず `not-seen` の場合だけ、担当者の判断で同じ署名済み取引を再送できる。

```sh
npm run issuer -- resume --state .issuer-state/deploy.json --rebroadcast
```

通信失敗では再送しない。nonceが消費済みなら停止する。新しいstateでやり直す前に発行者アカウントの履歴を確認する。同じ発行者で複数の配置・発行コマンドを並行実行しない。

同じstateへの同時実行は `.lock` で拒否する。異常終了でlockが残ったときは、発行者プロセスが残っていないことを確認してからlockだけを削除する。stateは削除しない。

CLIは上流の生エラー、キー、署名済み取引を出力しない。失敗時は設定・権限・保存済みstate・MultiBaas管理画面を確認し、`resume` で取引状態を確認する。

## MultiBaas形式の根拠

[公式SDK](https://github.com/curvegrid/multibaas-sdk-typescript/tree/main/docs) の `ContractOverview`、`ListContractVersions200ResponseAllOfResult`、`Contract`、`Address`、`EventIndexingStatus`、`TransactionToSignTx` に基づく。任意の404を不存在として扱わず、一覧取得が成功した場合にだけ未登録を判定する。既存LibraryのABI・bytecodeが異なる場合や、リンク済みバージョン・索引開始ブロックが異なる場合は停止する。

## デモの全員登録

`issue --card-id ID --state FILE --keystore FILE` のように `--wallet` を省略すると全員許可で発行する。コントラクト1.1.0ではallowedWalletのゼロアドレスが全員許可を示す。任意の本人ウォレットが初回登録でき、所有者は署名した送信者になる。登録済みカードの上書きはできない。従来の `--wallet ADDRESS` は指定先に限定する場合だけ使う。

## Optional ENS recipient

Use `--recipient-ens NAME` instead of `--wallet ADDRESS` when issuing a card. Set `ENS_SEPOLIA_RPC_URL` for Sepolia resolution. The CLI requires address confirmation and resolves again before signing. Omit both flags for unrestricted issuance. Resume uses the saved recipient without a new ENS lookup. See [ENS integration](../specs/ENS_INTEGRATION.md) for configuration and the PC demo procedure.
