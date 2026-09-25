# ハッカソンでの変更記録

大会中に作成した成果を、[既存成果](PRE_EXISTING_WORK.md) と区別して記録する。各作業の実施日時と大会開始時刻の対応は確認してから確定する。

## 2026-09-25: 開発記録の初期整備

大会期間内の作業として扱えるかは未確認。

- ユーザーが目的、worktree不要の方針、仕様文書の構成、プロンプト保存の要件を指定した。
- Codexが `AGENTS.md`、`specs/` の初期文書、`docs/prompts/README.md` と導入時のプロンプト記録を作成した。
- Codexが `.codex/hooks.json`、`.codex/config.toml`、`scripts/save_prompt.py`、`tests/test_save_prompt.py` を作成した。設定・実装・テストはAI支援によるもの。
- アプリの機能実装と既存コードの移植は行っていない。
- 対応する依頼は [bootstrap-request.md](../docs/prompts/bootstrap-request.md) に手動保存した。
- `python3 -m unittest discover -s tests -v` の6テストが成功した。設定内のhookコマンドを一時リポジトリで実行し、本文保持、並行保存、入力不正、保存失敗、別リポジトリの拒否、再配信を検証した。
- Codexの信頼設定後のセッション内自動実行は未確認。CLIの `/hooks` で信頼してから次の入力の保存を確認する。

今後は変更ごとに、対象ファイル、既存部分との差、人間の設計・実装・レビュー内容、AIツールと用途、対応プロンプト、検証コマンドと結果を追記する。
