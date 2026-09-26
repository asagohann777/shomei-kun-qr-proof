[English](LICENSE_POLICY.md) | 日本語

# ソースコードのMITライセンス

2026-09-26、ユーザーの指示により、本リポジトリのソースコードと付随する技術文書をMITで公開する方針を採用した。従来はルートLICENSEがなく、OwnershipRegistry.solはUNLICENSEDだった。

- ルートの[LICENSE](../LICENSE)にMIT本文と `Copyright (c) 2026 Shomei-kun QR Proof contributors` を記載。
- 管理対象のJS・TS・Solidity・Python・CSS・シェルソースにSPDX識別子を付与。shebangを先頭に保つ。既存の著作者表記は削除しない。
- OpenAPI生成コードも同じ識別子を出力するよう生成元を更新。
- Next.js管理の `next-env.d.ts` は自動生成のため手修正しない。
- 3パッケージのpackage.jsonとlockfileのルートメタデータにMITを記載。依存ライブラリのライセンスは変更しない。
- 提供された画像・ロゴ・カード等、外部資料・会話の引用、既存「証明くん」のコードやブランドは、このライセンス付与に含めない。画像等の提供者は[おじいちゃんコンビニ / asagohann777](https://github.com/asagohann777)。素材の個別許諾は従来どおり別途確認する。
- ソースライセンス変更は配置済みコントラクトの更新を意味しない。Solidityのメタデータは再コンパイルで変わり得るが、既存の配置・証跡は書き換えない。

MIT本文の出典: https://opensource.org/license/mit 。2026-09-26確認。

人間がMITの採用とREADME文言の変更を指定し、CodexがLICENSE、識別子、パッケージ情報と記録を整備した。今回の作業と大会期間との対応は未確認。

## 検証結果

76ファイルの識別子と、生成ヘッダー以外の処理本体が変更されていないことを照合した。3パッケージの依存関係は変更なし。OpenAPI生成物の整合性検査が成功。Solidityのコンパイルが成功し、ABI・作成時コード・実行時コードは不変、末尾のメタデータのみ更新されたことを確認して `contracts/abi/OwnershipRegistry.json` を再生成した。生成物の再照合も成功。デプロイは行っていない。
