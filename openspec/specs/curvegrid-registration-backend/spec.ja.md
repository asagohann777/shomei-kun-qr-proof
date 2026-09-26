[English](spec.md) | 日本語

# Curvegrid登録バックエンド

## Purpose

Curvegrid TestnetとMultiBaasを使い、本人ウォレットによるカード所有者登録と公開確認を提供する。UIモックを維持し、接続準備・登録取引・証跡再取得を分けて扱う。

## Requirements

### Requirement: 明示的な接続先とモード
システムはmock/liveを明示しなければならない（MUST）。liveは配置設定で指定したCurvegrid Testnetとコントラクトだけを扱い、障害時にmockへ切り替えてはならない（MUST NOT）。

#### Scenario: live設定が不足
- **WHEN** liveが選択されているが接続に必要な設定値がない
- **THEN** APIは503 CONFIGURATION_MISSINGと不足項目名だけを返し、固定成功データを返さない

#### Scenario: モード指定が不正
- **WHEN** BACKEND_MODEが未指定またはmock/live以外
- **THEN** 設定エラーとして扱い、接続処理を開始しない

#### Scenario: 接続先のチェーンが異なる
- **WHEN** MultiBaas・RPC・期待するchain IDが一致しない
- **THEN** 接続確認と登録準備は503 CONNECTION_MISMATCHになり、取引を渡さない

### Requirement: UIへ渡す接続状態
接続確認APIは取得済みのチェーン・最新ブロック・配置先・公開Web3設定を返さなければならない（MUST）。サーバー用APIキーや管理キーを返してはならない（MUST NOT）。

#### Scenario: 接続確認に成功
- **WHEN** 設定、認証、チェーン、RPC、配置先・ABI・発行者の照合が成功
- **THEN** mode=live、status=readyと公開ネットワーク・registry・latestBlockを返す

#### Scenario: 上流の認証拒否
- **WHEN** MultiBaasが401または403を返す
- **THEN** 503 MULTIBAAS_AUTH_FAILEDを返し、上流の本文やキーを出力しない

### Requirement: 発行者による一度限りの発行
コントラクトは固定の発行者だけにカードIDの発行を許可しなければならない（MUST）。発行済みIDや許可先を上書きしてはならない（MUST NOT）。

#### Scenario: 正常な発行
- **WHEN** 発行者が有効な未発行IDと許可ウォレットを発行
- **THEN** カードは未登録になり、発行イベントを記録する

#### Scenario: 重複・無権限・不正ID
- **WHEN** 既発行ID、別発行者、範囲外のIDで発行を試す
- **THEN** コントラクトは拒否し、元のカードを変更しない

### Requirement: 本人による初回登録
コントラクトは発行済み・未登録・登録許可・送信ウォレット本人の条件を満たす取引だけを登録しなければならない（MUST）。ownerとnicknameを同一取引に結び付け、再登録・移転・取消し・上書きを提供してはならない（MUST NOT）。

#### Scenario: 登録可能な本人ウォレットで登録
- **WHEN** 全員許可のカードまたは自分に限定されたカードへ、本人が有効なニックネームでregisterを送る
- **THEN** ownerと名前を保存し、カードと所有者・名前を結び付けたイベントを記録する

#### Scenario: 競合またはなりすまし
- **WHEN** 同じカードへ複数取引、未発行ID、許可外の送信者、登録済みカードへの再登録を試す
- **THEN** 条件に合う最初の登録だけが成立し、他は拒否される

### Requirement: 自由入力と未署名取引
live APIはニックネームをUTF-8で1〜96バイトの入力として扱い、勝手に正規化してはならない（MUST NOT）。登録準備は署名・送信を行わず、接続先とABI内容を照合した未署名取引だけを返さなければならない（MUST）。

#### Scenario: 正常な準備
- **WHEN** 未登録カードに登録可能なアドレス・正しいchain ID・範囲内の名前を指定
- **THEN** registerのcardIdと名前、from/to/chain/valueが照合された取引を返し、チェーン状態は変わらない

#### Scenario: 無効な入力
- **WHEN** 名前が空・96バイト超過・不正Unicode、本文超過、未知フィールド、別chain、許可外walletを送る
- **THEN** 定義された400/413/422で拒否し、未署名取引を渡さない

#### Scenario: MultiBaasの応答が意図と異なる
- **WHEN** submitted=true、宛先・呼出し・引数の不一致、または不正な応答形式を受信
- **THEN** 成功応答へ変換せず503とする

### Requirement: 未接続の公開読取り
APIはウォレット未接続でもカード状態と所有者を取得できなければならない（MUST）。未発行、未登録、証跡待ち、通信失敗を区別しなければならない（MUST）。

#### Scenario: 未発行カード
- **WHEN** 正常なコントラクト読取りがexists=falseを示す
- **THEN** 404 CARD_NOT_FOUNDとし、自動発行しない

#### Scenario: 証跡の検索同期が遅れている
- **WHEN** 登録済みownerを取得し、正常に完了したイベント検索が空
- **THEN** ownerを保持してevidence=pendingを返す

#### Scenario: MultiBaasの不明な404または通信障害
- **WHEN** 上流の不存在仕様を確認できない404、失敗、不正応答を受信
- **THEN** 503とし、未登録や取引不存在に変換しない

### Requirement: 取引と現在の記録の照合
APIは取引、ABI引数、receipt、正規ブロックのログ、現在のカード記録が一致した場合だけconfirmedを返さなければならない（MUST）。

#### Scenario: 正しい登録取引
- **WHEN** 対象カードの成功取引・正しいイベント・現在ownerと名前・blockHashが一致
- **THEN** confirmed、owner、登録hash、blockNumberを返す

#### Scenario: 異なる記録
- **WHEN** cardId、関数、送信者、宛先、名前、イベント発行元、hash、blockのいずれかが不一致
- **THEN** unknown/RECORD_MISMATCHを返し、confirmedにしない

#### Scenario: 確認中と失敗
- **WHEN** 対象register取引のisPending=true、または対象取引の失敗receiptを確認
- **THEN** 前者はpending、後者はrevertedとし、通信失敗と区別する

#### Scenario: 再確認
- **WHEN** 送信済みhashの照会を繰り返す
- **THEN** その時点の記録を再照合し、新しい取引を送信しない

### Requirement: CLIの再開と鍵の分離
発行者CLIは署名鍵をローカルで扱い、送信前に再開用情報を保存しなければならない（MUST）。再開で別の取引を自動生成してはならない（MUST NOT）。

#### Scenario: 配置後のリンクで中断
- **WHEN** 配置取引が成功し、ABIリンク前にCLIが中断
- **THEN** resumeは既存配置を確認してリンクだけを再開し、startingBlockを元の配置ブロックへ設定する

#### Scenario: 同じカードの再発行コマンド
- **WHEN** 同じID・許可walletの発行を再実行
- **THEN** 取引を送らず既存状態を返し、walletが異なれば失敗する

#### Scenario: 曖昧な送信結果
- **WHEN** 送信後の通信障害で結果を確認できない
- **THEN** 保存済みhashを照会し、通信失敗だけで再送せず、秘密鍵・署名済みraw txを公開しない

### Requirement: 別URLとUI互換性
バックエンドは既存UIモックと異なるWorkerへ配置しなければならない（MUST）。許可したUI OriginだけへCORSを付与し、既存mockの3 APIと固定シナリオを維持しなければならない（MUST）。

#### Scenario: UIの別Originから要求
- **WHEN** 設定済みUI OriginからAPIまたはpreflightを要求
- **THEN** 対応するCORSを返し、許可外Originには403を返す

#### Scenario: 既存mockを利用
- **WHEN** mockモードで既存19シナリオを実行
- **THEN** 既存の固定応答を返し、外部APIへ接続しない

### Requirement: UIのモックと実接続の切替
UIは環境変数でAPIとwalletを選択できなければならない（MUST）。既定はmock/mockとし、live/mockは閲覧専用、mock/metamaskは設定エラーにしなければならない（MUST）。

#### Scenario: UIデザインを続ける
- **WHEN** 通常のmock buildを使う
- **THEN** 実API・実walletに接続せず既存の表示シナリオを試せる

#### Scenario: 本人が実登録する
- **WHEN** live/metamaskで本人が公開内容を確認し、照合済み取引を承認する
- **THEN** walletが署名・送信し、APIで記録を照合した場合だけ確認済みになる

#### Scenario: 送信中にページを離れる
- **WHEN** 送信hash取得後または取得結果不明のままページを再表示する
- **THEN** 保存した対象の照会だけを再開し、署名・新規送信を自動実行しない

### Requirement: デモの全員登録許可

デモカードのallowedWalletがゼロアドレスの場合、任意の本人ウォレットからの初回登録を受理しなければならない（MUST）。発行CLIは省略時に全員許可とする。署名と初回登録後の不変性は維持する。

#### Scenario: 任意の参加者の初回登録
- **WHEN** 任意の本人ウォレットが全員許可の未登録カードを登録する
- **THEN** 送信者が所有者となり、別ウォレットを含めた後続の登録を拒否する

### Requirement: 登録準備時の残高不足

MultiBaasのregister準備が観測済みの残高不足を返す場合、APIは422 INSUFFICIENT_FUNDSとして案内しなければならない（MUST）。不明な上流エラーを残高不足と推測してはならない（MUST NOT）。

#### Scenario: ガス不足で準備できない
- **WHEN** 残高0の本人ウォレットで登録準備を行い、MultiBaasが400 insufficient funds for transferを返す
- **THEN** 画面でテストETHの補充を案内し、署名要求・取引送信を行わない

### Requirement: QRのカメラ・写真読取り
UIは利用者の操作でカメラを起動し、端末内でQRを解析しなければならない（MUST）。対象のカードURLだけを受け付け、画像・動画をアップロードしてはならない（MUST NOT）。カメラは独立したmock/live設定を持つ。

#### Scenario: QRの読取りに成功
- **WHEN** 対象の公開ページまたはカードAPIのURLを動画・写真から検出する
- **THEN** そのカードIDを現在のアプリで開き、カメラを停止する

#### Scenario: 非表示から復帰
- **WHEN** カメラ起動中にページが非表示になり、その後復帰する
- **THEN** 非表示時にカメラを停止し、復帰後は利用者の再開操作を待つ

#### Scenario: カメラを許可しない
- **WHEN** カメラを起動できない
- **THEN** 再試行と写真読取りを案内し、模擬成功を表示しない

### Requirement: iPhone・iPadのアプリ内登録
実接続UIはiPhone・iPadの外部ブラウザから同じカードをMetaMask内ブラウザで開けなければならない（MUST）。カードID以外の入力や接続情報をリンクへ含めてはならない（MUST NOT）。

#### Scenario: 外部ブラウザで未登録カードを開く
- **WHEN** iPhoneまたはiPadでMetaMask providerがない
- **THEN** 入力前に「MetaMaskで開く」を表示し、直接のdappリンクへ同じカードURLを渡す。SDK接続を自動開始しない

#### Scenario: iPadがデスクトップ表示を使う
- **WHEN** Macintoshの識別情報と複数タッチ点を持つ端末で開く
- **THEN** iPadとして同じアプリ移動導線を表示する

#### Scenario: アプリ内ブラウザが開かない
- **WHEN** 利用者が「ページが開かないとき」を開く
- **THEN** 同じカードのHTTPS URLとコピー操作を表示し、MetaMask内への貼付けを案内する

#### Scenario: MetaMask内で開く
- **WHEN** MetaMask providerがある
- **THEN** 再びアプリ移動を求めず、本人の接続と登録へ進む

### Requirement: 接続準備と登録の分離
UIは接続・ネットワーク追加・切替を登録取引と分けなければならない（MUST）。準備では登録取引を作成・送信してはならない（MUST NOT）。

#### Scenario: ネットワークの準備
- **WHEN** 接続したウォレットが対象チェーンと異なる
- **THEN** 切替を要求し、未対応チェーンの応答がある場合だけ追加を案内する

#### Scenario: 承認待ちでアプリへ移動
- **WHEN** 承認中にページが非表示になる
- **THEN** 次の承認要求を止め、復帰後に状態を照合する。要求を重ねて送らない

#### Scenario: 応答を確認できない
- **WHEN** 前面で60秒待っても準備の応答を確認できない
- **THEN** 確認待ちと再確認の操作を示し、取消しや接続済みと決め付けない

### Requirement: 初回登録の待機と証跡再取得
UIは初回登録後に最大60秒、取引と証跡を確認しなければならない（MUST）。登録済みカードの取得を登録処理として表示してはならない（MUST NOT）。

#### Scenario: 証跡の反映だけが遅れる
- **WHEN** 取引成功と所有者は一致するが、60秒以内に証跡検索へ反映されない
- **THEN** 登録完了と証跡待ちを分けて表示する

#### Scenario: 取引成功を確認できない
- **WHEN** 60秒以内に取引成功を確認できない
- **THEN** 結果未確認と表示し、自動再送しない

#### Scenario: 登録済みカードの再取得
- **WHEN** 利用者が証跡を再取得する
- **THEN** カードと所有者を保持し、ステータス欄だけを更新する。失敗時も取得済みの情報を残す
