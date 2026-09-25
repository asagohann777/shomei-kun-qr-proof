# 導入時の依頼

保存方法: Codexがこの会話のユーザーメッセージを手動転記した。hook導入前のため、自動取得の日時・セッションID・ターンIDは付与していない。

以下が依頼本文。

```text
まず AGENT.mdの整備をする

ハッカソンのルールでプロンプトも含めてリポジトリに含めたい
https://ethglobal.com/events/tokyo2026/info/details　を確認して
codexのhooks で docs/prompts配下に保存されるようにしたい
このルールをhookとして実装せよ

グローバルの設定ではworktreeを強制しているが、本フォルダでは利用しなくて良い

仕様は specs/ 配下に以下の内容が保存されるようにする

SPEC.md
ARCHITECTURE.md
PRE_EXISTING_WORK.md
HACKATHON_CHANGES.md

中身に関してはこれから詰めるが、本リポジトリの目的としては

本プロジェクトは天地愛プロジェクトの証明くんの既存プロジェクトから新たにOSSとして機能の参照実装とデモアプリを作ることである
```
