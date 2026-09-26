[English](README_JA_PLAN.md) | 日本語

# 日本語READMEの作成

2026-09-26 JST。ユーザーの指示で最新mainをpullした。作業開始時のmainは `33a9def` で、origin/mainと一致していた。本リポジトリの直接作業の例外に従う。

## 採用した内容

- まず日本語で作成し、後から英語化する。
- 提供アイコンをロゴとして冒頭に表示し、カバー画像を添える。
- スクリーンショットは直前の指示を引き継ぎ、埋め込まずリンクにする。英語UIデモ9枚と実取引の証跡を区別する。
- 概要、操作、既存成果と今回の追加機能、Continuityトラック、開発記録・AI利用の参照先を記載する。
- 既存PoCのコード移植や利用者データ連携は主張しない。実装済み機能と大会期間中の成果を同一視しない。
- Continuityはユーザーが今回指定した提出方針。細分類、応募完了、パートナー賞への適格性は未確認。
- 別セッションで仕様書を修正中のため、SPEC.mdやARCHITECTURE.mdの本文は変更しない。既存資料に残るAmoyの計画と実接続のCurvegrid Testnetを区別し、READMEは実接続の検証記録を参照する。
- unslopを適用し、誇張と抽象的な説明を削る。

## 参照先

2026-09-26に確認した。

- https://tennchiai.com/ : 既存「証明くん」の記録・継続証明に関する紹介。サイト上の説明を、今回の実装実績とは扱わない。
- https://ethglobal.com/events/tokyo2026/info/details : Continuity Tracks、既存成果の開示、新規機能、AI使用箇所と仕様・プロンプト・計画の提出要件。
- PRE_EXISTING_WORK.md、HACKATHON_CHANGES.md、OPEN_REGISTRATION_DEMO.md、APPLE_METAMASK_BROWSER_PLAN.md、SUBMISSION_ASSETS_2026-09-26.md。

人間が掲載要素、言語、既存プロジェクト、参加トラックの方針を指定。Codexが資料照合、READMEの執筆とリンク・表示確認を担当。今回の作業と大会期間の対応は未確認。

## 追加の修正指示

READMEからスクショの模擬動作に関する説明と撮影条件へのリンクを削除し、素材提供者にGitHub IDとリンクを併記した。撮影条件の記録自体は保持。ソースコードにMITを採用し、詳細はLICENSE_POLICY.mdへ記録した。

## 英訳とPR

日本語草稿とMIT整備の承認後、ユーザーの指示でルートREADMEを英訳した。画像・リンク・範囲と削除済みの文言を維持し、unslopで文を整理した。日本語の仕様・プロンプト・検証記録は原文を保持する。MIT整備と合わせてPRを作成する。
