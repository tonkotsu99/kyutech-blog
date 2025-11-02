## Why

現在は入室（在室）と退室の二値管理しかできず、研究室外だが学内にいる状況を表現できません。学内にいるメンバーを把握できるようにすることで、連絡調整や在室確認を柔軟に行いたいという要望があります。

## What Changes

- ユーザープロフィールに在室状態のステータスを追加し、「在室」「学内」「学外」を区別できるようにする
- `POST /api/attendance/inside-area` エンドポイントを実装し、認証済みユーザーが自分のステータスを「学内」に切り替えられるようにする
- 既存の入退室 API・UI を更新し、新しいステータスと整合のとれた表示・振る舞いにする
- Prisma スキーマとマイグレーションを更新し、在室ステータスを永続化する

## Impact

- Affected specs: `attendance`
- Affected code: `prisma/schema.prisma`, `src/app/api/attendance/**/*`, `src/lib/prisma/attendance.ts`, `src/lib/prisma/user.ts`, `src/components/attendance/**/*`, `src/lib/validations/profile.ts`
