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

## 2026-09-25: 相談用のスマホUIモック

大会期間内の作業として扱えるかは未確認。対象はこのリポジトリ内の新規モックで、既存PoCの実装・データ・公開設定には接続していない。

### 人間の決定とAIの使用範囲

ユーザーがチーム相談用のUIモック、スマホのみの対応、QRスキャン画面、CSSフレームワークによる制作コスト削減を指定した。計画中に所有者情報を優先する構成、模擬QR読取り、公開URLでの共有を選び、実装を承認した。出典は [UI_MOCK_PLAN.md](UI_MOCK_PLAN.md) にまとめた。対応する5件のhook JSONの `source` と本文を確認した。その後、スキャンボタンから模擬カメラへ進む指示と、短い文言・注釈削除・UI調整の指示を反映した。追加3件のhook JSONも採用計画から参照できる。

Codexが `prototypes/mobile-ui/` のHTML、JavaScript、翻訳、CSS、SVG、ビルド・ブラウザ検証スクリプト、Cloudflare設定、READMEを作成した。package-lockはnpmが生成した。AIは構成2案を比較し、単一コントローラーとシナリオ状態を採用した。別エージェントによるコメント確認で不要なコメントを1件削除した。

Codexが `SPEC.md`、`ARCHITECTURE.md`、`DEMO.md`、`PLAN.md`、`PRE_EXISTING_WORK.md`、`UI_MOCK_PLAN.md`、この変更記録を更新した。画面画像は実ブラウザのスクリーンショットであり、画像生成AIの完成予想図ではない。カードイラストとアイコンはCodexによる新規SVGで、既存サイトの画像や実在選手の写真は流用していない。

### 実装と公開

- QRスキャン、カード・公開確認、所有者登録、登録処理の4画面を実装した。QR画面は入口のボタンから模擬カメラへ進む。根拠・接続・状態選択はボトムシートにまとめた。
- 画面の重複注釈、装飾の盾、説明ボックスを削り、ニックネームとウォレットを先に表示した。登録・承認・エラーの文言を短くし、同意欄は標準チェックボックスに揃えた。
- daisyUI 5.7.46、Tailwind CSS 4.3.3を使用した。Next.js・TypeScriptによる実接続版を実装したとは扱わない。
- 日英切替、言語保存、同じタブでの模擬入力・処理状態の復元、10種類の相談用シナリオを実装した。
- 「結果不明」は同じ模擬操作を再確認し、「承認拒否」は未送信に戻る。実際の署名・送信・チェーン照会はない。
- 公開先は [スマホUIモック](https://shomei-kun-ui-mock.dptr.workers.dev/)。既存Worker名と重複しないことを確認して新規作成した。Cloudflare Worker名は `shomei-kun-ui-mock`、公開バージョンは `0f4b15c3-79d3-4715-a7c4-bd4e6fa82ce0`。
- 公開URLのHTTP 200、カメラ・マイクを許可しないPermissions-Policy、CSP、noindexを確認した。共有URLとQRに入力した名前や秘密情報を含めない。

### 検証

Node.js 22.23.1、Playwright 1.61.1を使用した。`npm run build` が成功。ローカルでChromium 149.0.7827.55とWebKit 26.5の操作検証が成功した。検証スクリプトと実行方法は [モックのREADME](../prototypes/mobile-ui/README.md) に保存した。

320・390・430px、PCでのスマホ幅表示を撮影し、英語の320・390pxも確認した。横はみ出し、欠落画像、コンソールエラーを自動確認し、画面の画像を目視した。下部操作の上まで最後の内容をスクロールできることも確認するスクリプトにした。

模擬接続・公開同意・登録・再読込・入力の表示・言語保存・初期言語選択・別チェーン・承認拒否・失敗からの復帰・同じ模擬取引の再確認・根拠取得中・未発行・情報取得不能を操作した。操作中の全ブラウザ要求が同一オリジンへのGETであることを確認し、外部APIへの接続や送信処理がないことを検証した。

画像確認でdaisyUIのCSSレイヤーによる下部ボタン幅の競合を見つけて修正した。WebKitのLinux環境では既定の代替フォントで英数字が描画されなかったため、Arialの代替指定を追加した。検証環境の共有ライブラリは `/tmp` に取得し、WebKit用の一時起動スクリプトで参照した。配布スクリプトのライブラリパス上書きと、システムのライブラリ一覧だけを見る事前検査を回避して実ブラウザを起動した。通常環境ではREADMEの `playwright install --with-deps` を使用する。

公開版ではPlaywright 1.61.1のWebKit撮影処理が `body {}` の一時style要素を挿入し、CSP警告を出すことを最小操作と依存ソースで確認した。撮影中のこの特定メッセージだけを `playwrightScreenshotCspWarnings` として別集計し、アプリ操作時のエラーは引き続き失敗にする。配信CSPは緩和していない。

スマホ実機、実カメラ、MetaMask往復、MultiBaas API、Amoy、CLI・コントラクトは未検証。F01〜F10、A01〜A11の実接続試験に合格したとは扱わない。今回の作業ではコミット・pushは行っていない。

最終公開版の検証がChromium・WebKitで成功した。320・390・430pxとPC幅、日英表示、スキャン入口から模擬カメラへの遷移、登録フローを確認した。公開されている7アセットがローカルのビルドとバイト単位で一致し、SHA-256を保存した。

- [実行日時・ブラウザ・配信アセットの検証結果](assets/ui-mock/results.json)
- [スキャン入口](assets/ui-mock/scan-entry.png)、[模擬カメラ](assets/ui-mock/camera-preview.png)、[公開確認](assets/ui-mock/registered-owner.png)
- [所有者登録](assets/ui-mock/registration.png)、[承認](assets/ui-mock/approval.png)
- [WebKit・320pxの模擬カメラ](assets/ui-mock/webkit-camera-320.png)、[WebKit・390pxの登録](assets/ui-mock/webkit-registration-390.png)、[430pxの公開確認](assets/ui-mock/owner-430.png)、[英語・320px](assets/ui-mock/english-320.png)

操作中のアプリのコンソールエラーは0件。WebKitの撮影ツール由来のCSP警告72件は別記録した。公開直後のアセット比較で一度不一致が出たため、配信内容を再取得して確認し、一致した状態で全検証を完了した。文書の参照先・要件ID・空白、JavaScriptの構文も確認した。

## 2026-09-25: おじいちゃんコンビニのデザイン制作途中の成果物を保存

ユーザーが、おじいちゃんコンビニ、GitHub ID `asagohann777` の制作途中の成果物として画像9点とChatGPT共有会話の保存を指定した。制作日時と大会期間との対応は未確認。

- Codexが [画像9点](assets/asagohann777/2026-09-25/README.md)を元のファイル名・内容のままコピーし、作者情報、出典、SHA-256を記録した。元画像と保存先9点のバイト単位の一致を確認した。
- Codexが [プロンプトの出典記録](../docs/prompts/asagohann777-design-2026-09-25.md)を手動作成した。共有URLはブラウザでも読み込めず、本文は未取得。保存依頼のhook記録と外部会話の本文を区別した。
- 画像は制作途中として保存した。採用判断、画像編集、アプリへの反映は行っていない。各画像のAI使用範囲・ライセンスは未確認。

その後、ユーザーが会話本文を貼り付けた。Codexが対応するhook JSONから [会話抜粋の原文](../docs/prompts/asagohann777-design-2026-09-25-transcript.txt)を抽出して保存した。ユーザー指示とChatGPT回答が混在する本文を編集せず、hook記録の該当部分と完全一致することを確認した。共有URL自体の取得失敗は解消していない。

## 2026-09-26 JST: 固定モックのWeb API詳細設計

ユーザーが、MultiBaas・ウォレット署名・送信のモック化、固定サンプル応答、Web API優先、サンプル入力への限定を選択し、設計成果物の作成計画を承認した。大会期間との対応は未確認。

Codexが [詳細設計](BACKEND_DESIGN.md)、[OpenAPI定義](openapi.yaml)、[静的検証スクリプト](../scripts/verify_backend_spec.py)、[検証用依存定義](../scripts/requirements-backend-spec.txt)、[会話の選択記録](../docs/prompts/backend-design-decisions.md)を作成した。`SPEC.md`、`ARCHITECTURE.md`、`PLAN.md`、この変更記録も更新した。APIのフィールド、状態、照合条件、エラーと試験計画の具体化にAIを使用した。

Python 3.11でOpenAPI 3.1の構文・参照を検証した。3 APIの応答例30件、シナリオ19件、固定値の対応が検証に合格した。不正な入力・応答10件がJSON Schemaで拒否されることを確認した。最初の検証でサンプルアドレスが42桁の16進数になっていたため40桁へ修正し、再検証した。再実行手順は詳細設計書に記載した。文書のローカル参照先、要件ID、空白も確認した。

B01〜B11はAPI実装後の試験計画で、実行していない。APIサーバー、Gateway、ウォレット、Amoy接続は未実装。既存UI・既存PoCの変更、デプロイ、commit・pushは行っていない。

## 2026-09-26 JST: 固定モックのWeb APIを実装

[詳細設計に沿った実装指示](../docs/prompts/2026-09-25/152556-790938-5fdac443e5ab4602b26eb512cec3edb6.json)を受け、カード取得・登録準備・登録確認の3 APIを [apps/web](../apps/web/README.md) に追加した。大会期間との対応は未確認。

CodexがNext.js・TypeScriptの構成、Route Handler、Registration Service、Mock Gateway、Mock Walletの操作ライブラリ、OpenAPIからの型・検証関数・固定サンプル生成、試験と起動手順を作成した。実装担当エージェントが `src/backend` と `src/app` を担当し、親エージェントが構成・生成・試験・文書を担当した。既存PoCのコードやデータは流用していない。

登録準備はカード・許可ウォレット・チェーン・サンプル名を検証する。確認では取引、レシート、イベント、現在の登録内容を照合する。署名・送信・MultiBaas接続はモックで、DBや登録結果の保存はない。Mock Walletの拒否後に確認を開始せず、結果不明から自動再送しない。

OpenAPIの型定義に合わせた判別可能な型を使用した。Workersでは動的コード生成を使わず、Ajvの検証コードを事前生成する。TypeScriptはOpenAPI型生成の互換条件に合わせ5.9.3とした。依存バージョンとlockfileを保存した。

36件のサービス・境界・設定・Wallet試験、Next.jsとローカルWorkersそれぞれ24件のHTTP試験が成功した。OpenAPIの静的検証、生成物一致、型チェック、Next.jsとWorkers向けビルドも成功した。Workersの404には追加のキャッシュ制御指定が付くため、保存禁止を維持したままAPI定義と試験を調整した。初回の失敗と実行環境上の対応は [実装・検証記録](BACKEND_IMPLEMENTATION.md) に記載した。

AIで作成・変更したファイルは `apps/web/` の実装・構成・試験・README・生成物、`scripts/verify_backend_spec.py`、`specs/openapi.yaml`、`BACKEND_IMPLEMENTATION.md`、`BACKEND_DESIGN.md`、`SPEC.md`、`ARCHITECTURE.md`、`PLAN.md`、この変更記録、[HTTP試験結果](assets/backend/http-next.txt)と [Workers試験結果](assets/backend/http-worker.txt)。生成物はOpenAPIと生成スクリプトから再現できる。

既存UIの接続、実ウォレット・MultiBaas・Amoy、発行者CLIは未実装・未検証。F01〜F10・A01〜A11の実接続試験の合格とは扱わない。既存UI・既存PoCの変更、デプロイ、commit・pushは行っていない。

## 2026-09-26: おじいちゃんコンビニの追加図案を保存

ユーザー指定の `origin/main` をfast-forwardで取り込んだ後、[追加図案12点の一覧](assets/asagohann777/2026-09-26/README.md)を作成した。新規8点を保存し、既存4点は内容が一致する保存済みファイルを参照した。12点すべてを元画像とバイト単位で照合した。制作プロンプトは未受領。大会期間との対応は未確認。

ユーザーが作者を指定し、共同著者付きコミットを指示した。Codexがコピー、照合、一覧とハッシュの記録を担当した。UI変更はこの画像保存コミットの後に行う。
