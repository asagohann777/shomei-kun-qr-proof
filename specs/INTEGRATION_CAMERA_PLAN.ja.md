[English](INTEGRATION_CAMERA_PLAN.md) | 日本語（原文保存版）

# integrationで実カメラを有効にする

2026-09-26。ユーザーが最新mainのカメラ機能をintegrationで試すことを依頼した。

## 方針

最新main `0a59574` は既に作業ブランチへ取り込み済み。実カメラが使えなかった原因は、integrationを `UI_CAMERA_MODE=mock` でビルドしていたことだった。専用integrationは `UI_CAMERA_MODE=live` で再ビルドし、ローカルの `.env.local` にも保存する。既定mock、API・ウォレットのモード切替、UIモックWorkerは維持する。カメラの実装は変更しない。

## 結果

Worker version `7a4a7673-a63b-465e-8cc8-a648561931fe` を公開。公開JS/CSS/HTML 24件がビルドと一致。カメラのPermissions-Policyがselfを許可すること、ボタンを押す前にはカメラを要求しないことを確認した。

Chromiumでは生成した動画のQRを実デコーダで読み取り、カードIDがAPIへ渡り、カメラのトラックが終了した。WebKitではカメラ拒否を模擬した後、写真のQRを読み取れた。両方で通信失敗は未登録に置き換わらず、再取得導線を表示した。試験ではAPIを503応答へ置換し、カードの発行・登録取引は送っていない。iPhone実機でのカメラ確認は未実施。

再現スクリプトは `prototypes/mobile-ui/scripts/verify-camera-public.mjs`。[公開試験結果](assets/metamask-preparation/camera-public-results.json)。

## 試し方

https://shomei-kun-integration.dptr.workers.dev/ui/ を開き、「QRコードをスキャン」からカメラを許可する。既存カードのQRを読み取る。カメラを使えない場合は「写真から」を使う。
