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

## 2026-09-25: QR登録機能の仕様・設計・デモ手順

大会期間内の作業として扱えるかは未確認。今回は文書作成のみで、アプリ・コントラクト・発行者CLIの実装、既存コードの移植、コミット、push、提出、デプロイは行っていない。

### 人間が指定・決定した内容

- ユーザーが既存PoCの存在と既存機能、QRからの登録所有者確認、発行者CLI、F01〜F10、画面要件、日英表示を指定した。
- ユーザーがNext.js・TypeScript・Cloudflare・Curvegrid Testnetを指定した。
- ユーザーがニックネームのオンチェーン保存、既存PoCから独立したデモ、取引情報とRPC照合手順を選択した。
- ユーザーが当初のPC登録案をスマホ登録へ訂正した。
- ユーザーが文書作成計画を確認し、「Implement the plan.」と指示した。作成後の文書レビューは未実施。

### AIを使用したファイル・用途

| ファイル | Codexによる作業 |
| --- | --- |
| [SPEC.md](SPEC.md) | 初期文書を具体化。役割、機能要件、画面、状態、日英表示、受け入れ条件を整理 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 構成、権限、識別、記録、最小インターフェース、データの流れ、技術選定と未確認事項を記載 |
| [DEMO.md](DEMO.md) | 事前準備、発行、スマホ登録、別端末での閲覧、RPC照合、検証記録の手順案を作成 |
| [PRE_EXISTING_WORK.md](PRE_EXISTING_WORK.md) | ユーザーが説明した既存機能と新規範囲を区別し、参照元と流用未実施を記録 |
| [PLAN.md](PLAN.md) | 採用済みの文書作成計画を会話から手動保存 |
| [選択回答の手動記録](../docs/prompts/qr-proof-decisions.md) | hookのJSONに含まれない選択質問と回答、スマホへの訂正を出典付きで保存 |
| この変更記録 | 人間の判断、AI作業、参照プロンプト、検証範囲を記録 |

Codexが公式サイト・公式技術資料を調査し、既存PoCの実装確認とは区別した。`openspec-explore` で議論し、文章整理に `unslop` と `technical-writing` を使用した。採用計画の範囲で文書を作成し、OpenSpec changeの作成や機能実装は行っていない。

### 対応するプロンプト

- [最初の機能要件と資料作成依頼](../docs/prompts/2026-09-25/121716-439190-2cd0d9f92aa8468588e7978b39382568.json)
- [スマホ登録への訂正](../docs/prompts/2026-09-25/122429-037897-c475cb8e8fd244c08302e2043f25f922.json)
- [計画の実行指示](../docs/prompts/2026-09-25/122651-114438-1fe83e01648547c1a4e98d4f8cc0ec12.json)
- [選択式の質問と回答](../docs/prompts/qr-proof-decisions.md)

上記3件のJSONは `source: codex:UserPromptSubmit` と本文を確認した。選択回答と採用計画は手動記録であり、自動保存と扱わない。既存の「開発記録の初期整備」にあるhook未確認の記述は当時の状態を残したもので、今回の3件の保存確認とは区別する。

### 検証

文書を読み合わせ、スマホ登録、オンチェーンのニックネーム、既存PoCとの分離、公開用RPC照合、日英表示、一度限りの登録が採用計画と一致することを確認した。

- `git diff --check`: 成功。
- 下記のPythonによる静的確認: 7文書、32件のローカルリンクと参照先、F01〜F10の定義と受け入れ条件への対応、A01〜A11の一意性、行末空白・末尾改行を確認し、成功した。
- `git status --short --untracked-files=all`: 変更対象が文書とプロンプト記録であることを確認した。新規ファイルを含め、コミットはしていない。

静的確認はリポジトリのルートで次のコマンドにより再実行できる。要件IDの機械的確認だけで内容の妥当性を保証するものではない。

```sh
python3 - <<'PY'
import re
from pathlib import Path
from urllib.parse import unquote

files = sorted(Path('specs').glob('*.md')) + [Path('docs/prompts/qr-proof-decisions.md')]
links = 0
for path in files:
    text = path.read_text()
    assert text.endswith('\n'), f'{path}: missing final newline'
    assert not any(line.rstrip() != line for line in text.splitlines()), path
    for target in re.findall(r'\]\(([^)]+)\)', text):
        if '://' in target or target.startswith('#'):
            continue
        name, _, anchor = target.partition('#')
        resolved = (path.parent / unquote(name)).resolve()
        assert resolved.is_file(), f'{path}: missing {target}'
        if anchor:
            headings = re.findall(r'^#{1,6} (.+)$', resolved.read_text(), re.M)
            assert unquote(anchor) in headings, f'{path}: missing anchor {target}'
        links += 1
spec = Path('specs/SPEC.md').read_text()
acceptance = spec.split('## 受け入れ条件')[1].split('## 未確認事項')[0]
for index in range(1, 11):
    fid = f'F{index:02}'
    assert len(re.findall(r'^\| ' + fid + r' \|', spec, re.M)) == 1, fid
    assert fid in acceptance, fid
for index in range(1, 12):
    aid = f'A{index:02}'
    assert len(re.findall(r'^\| ' + aid + r' \|', spec, re.M)) == 1, aid
print(f'PASS: {len(files)} documents; {links} local links; F01-F10; A01-A11; whitespace')
PY
```

アプリ動作、スマホ実機、チェーン接続、コントラクト試験、デプロイは未実施。仕様のA01〜A11は今後実行する試験であり、合格結果ではない。

## 2026-09-25: MultiBaas API中心・Polygon Amoyへの変更

大会期間内の作業として扱えるかは未確認。上の文書作成記録は当時の判断と検証結果を保存したもの。現行のチェーンとアクセス方法はこの変更を優先する。

- ユーザーがCurvegrid Testnetの公開性を確認し、MultiBaas APIを中心にしてAmoyを使うよう指定した。
- Codexが `SPEC.md`、`ARCHITECTURE.md`、`DEMO.md`、`PLAN.md`、この変更記録を更新した。アプリ・CLIによる状態読取り、未署名取引作成、レシート・イベント照会をMultiBaas API中心へ変更した。
- 記録先をPolygon Amoyに変更し、チェーンID 80002、テストPOL、Amoy RPC、Polygonscanの役割を記載した。本人の署名・送信はMetaMask、発行者の署名はCLI側で行う。
- アプリ用APIキーはサーバー側で管理する。外部照合はMultiBaasに依存しないAmoy RPCとPolygonscanを使う。
- API障害・イベント同期遅延の受け入れ条件を追記した。過去の選択回答と初版計画は履歴として残した。
- 公式資料で設定値とAPIの用途を確認した。Amoy向けMultiBaas環境への接続、コントラクト配置、API・実機の動作検証は未実施。アプリ実装・コミット・デプロイは行っていない。

対応する入力は [公開性とAPIに関する質問](../docs/prompts/2026-09-25/124052-021791-e097150dfc834db6b871cd0dbce92976.json) と [MultiBaas API中心・Amoyの指定](../docs/prompts/2026-09-25/124238-516565-940307cad70d42acbdf9ec9f2ebda8bc.json)。両方ともhookのJSON内の `source` と本文を確認した。

検証: 上記のPythonコマンドを再実行し、7文書・35件のローカルリンク・F01〜F10・A01〜A11・空白検査が成功した。`git diff --check` も成功した。仕様・設計・デモ手順のMultiBaas APIとAmoyの役割を読み合わせ、Curvegrid Testnetを現行の記録先として残していないことを確認した。実サービスへの接続試験は未実施。
