# デモの登録許可を全員へ変更

2026-09-26。ユーザーの訂正により、発行済み・未登録のデモカードは誰でも自分のウォレットで登録できる。従来の許可アドレス指定をデモの前提にしない。本人ウォレットの署名、発行者のみのカード発行、未発行カード拒否、最初の登録後の上書き・二重登録拒否は維持する。

ABIの `allowedWallet` がゼロアドレスなら全員を許可する。発行CLIは `--wallet` を省略すると全員許可にする。既存の指定アドレス付きカードの記録も読み取れる形式を保つ。所有者は送信者 `msg.sender` から決まり、ゼロアドレスや画面で入力したアドレスを所有者にはしない。

配置済みコントラクトは変更できないため、修正版を新しいアドレス・MultiBaas Library version 1.1.0で配置し、専用integrationの記録先を切り替える。旧コントラクトの登録記録は削除・上書きしない。過去の試験証跡は旧アドレスとともに保存する。既存の未登録手動URLに対応するカードIDを新しい発行単位で再発行し、複数人の試行用に追加カードも発行する。

実装と並行して、API失敗に受付IDを付け、ブラウザの直近20件の診断情報をコピーできるようにする。APIキー、RPC URL、秘密鍵、ニックネーム、署名前の取引本文は記録しない。サーバーでは拒否コードと許可先・接続アドレスを照合できる。ガス代は接続ウォレットに必要である。

## 公開先

- [手動用カード](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=mobile-ui-20260926-manual)
- [予備カード1](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=demo-open-001)
- [予備カード2](https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=demo-open-002)

記録先は `0x0721F6260a83577015F71a50BB46c09B5e15BcAA`、version1.1.0、開始block18773。配置取引は [配置記録](assets/curvegrid-connectivity/open-demo-deployment.json) を参照。過去の登録済み試験カードは旧記録先 `0xE226ABd4e3866568C7bd53a57f2CA4b619EFB47e` に残り、今回のAPI既定記録先には移していない。

公開APIで2つの別アドレスの登録準備が200になった。自動試験で登録後の照合に残る旧許可先比較を検出し、登録準備・イベント・取引照合を同じ許可判定へ揃えた。登録後は実際のownerと取引送信者も照合する。

ブラウザの失敗画面に「エラー詳細をコピー」を追加した。コード、受付ID、カードID、接続アドレス、チェーン、取引ハッシュと発生時刻を最大20件コピーできる。Clipboardが使えない場合は画面にテキストを表示する。サーバーは4xxも構造化ログに残し、レスポンスの `X-Request-ID` と照合できる。Cloudflare Observabilityを専用Workerで有効にした。

ログの確認は `apps/web` で `npx wrangler tail --config wrangler.integration.jsonc --format json`。CloudflareのWorker Logsからも受付IDを照合できる。デモの全員許可カードではWALLET_NOT_ALLOWEDは発生しない。ガス不足は専用文言で案内する。

## 最終検証

専用Worker version `c8456faa-b0d6-4e7b-a9c4-9d0862d8610b` を公開。以前の手動カード許可先とは別の試験アドレス `0xf12904Ef7aBfD79b68dcCdc7b30cFDE2D6BEeeb8` で `demo-open-check-2` を実登録した。取引 `0xf0b1133e12c01606a52783eb64179d8a2529f8fcd088f43ebd9f8cb3dc2b2362` がconfirmedになり、送信は1回、再読込・第三者の別ブラウザ表示も成功した。実スマホMetaMaskの操作とは区別する。

[実登録結果](assets/open-registration-2026-09-26/chain-results.json)、[公開API検証](assets/open-registration-2026-09-26/api-verification.json)、[未登録カード3枚とエラー受付ID](assets/open-registration-2026-09-26/manual-cards.json)、[画面試験](assets/open-registration-2026-09-26/browser-results.json)を保存した。API70件・UI43件・コントラクトとCLI17件、型検査、OpenSpec strict、秘匿情報検査が成功。Chromium/WebKitの320・390・1365pxで診断コピーとエラー表示を確認した。
