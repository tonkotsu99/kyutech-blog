## Context

現状の在室管理は `Attendance` レコードと `UserProfile.isCheckedIn` のブール値のみで構成されており、研究室内にいるか否かしか表現できません。研究室外だがキャンパス内に滞在しているケースを区別できないため、連絡・面談などの調整が難しいという課題があります。

## Goals / Non-Goals

- Goals:
  - `UserProfile` に在室ステータスを追加し、「在室」「学内」「学外」を切り替えられるようにする
  - ステータスを変更するための API エンドポイントを設け、UI から操作できるようにする
  - 既存の入退室フローと矛盾が生じないようにデータ更新順序を定義する
- Non-Goals:
  - BLE や自動検知との連携は対象外
  - 過去の在室履歴にステータスを後付けすること（履歴は従来どおりチェックイン／チェックアウト時間で管理）

## Decisions

- Decision: `UserProfile` に `presenceStatus` (enum: `IN_LAB`, `ON_CAMPUS`, `OFF_CAMPUS`) を追加し、現行の `isCheckedIn` と併用する。入室時に `IN_LAB`、退室時に `OFF_CAMPUS`、学内切替時に `ON_CAMPUS` を設定する。
  - Alternatives considered: `Attendance` にステータス列を追加する案 → 過去履歴と現在状態が混在し、最新レコードを常に参照する必要があるため却下。`isCheckedIn` を三値に拡張する案 → 既存フロントの boolean 条件分岐を全て修正する必要があり、段階的移行が難しい。
- Decision: `/api/attendance/inside-area` は `POST` で自身のステータスのみ更新する。既存の在室レコードがアクティブな場合はチェックアウト処理を行い、滞在履歴の整合性を保つ。
  - Alternatives considered: ステータスだけ更新しレコードはそのままにする → 滞在時間が延々と伸び続け在室統計が崩れるため却下。

## Risks / Trade-offs

- `isCheckedIn` と新 enum の二重管理になるため、コードの同期漏れリスクがある。ユーティリティ関数を用意して一貫性を担保する必要がある。
- 既存 UI にステータスを表示するためのデザイン調整が必要になるが、詳細なデザイン指針が未確定。

## Migration Plan

1. Prisma スキーマに enum とフィールドを追加し、マイグレーションを実行する。
2. 既存ユーザーの `presenceStatus` をマイグレーションで `isCheckedIn` を参照して初期化する。
3. API・サーバーアクションを更新し、ステータスを一貫して更新する。
4. フロントエンドを新ステータスに対応させ、操作 UI を追加する。

## Open Questions

- 学内ステータスに切り替えた後、UI 上でどのように再入室ボタンや退室ボタンを提示するか。デザイン調整が必要な場合は別途相談する。
