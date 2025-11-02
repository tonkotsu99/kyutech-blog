## Why

在室ステータスに「学内 (ON_CAMPUS)」が追加されたものの、Localabo の在室状況画面では表示が二分のみのままです。学内にいるメンバーを一目で把握できるように UI を更新する必要があります。

## What Changes

- `/api/attendance/all` など Localabo で利用する API が `presenceStatus` を返却するように調整
- Localabo の在室状況 UI を「在室」「学内」「学外(退室)」の 3 区分で表示するように更新
- 学内メンバー表示に応じたスタイル・バッジ・カウンターを追加し、既存のリンク操作を維持

## Impact

- Affected specs: `attendance`
- Affected code: `src/app/api/attendance/all/route.ts`, `src/components/attendance/all-attendance-list.tsx`, `src/lib/prisma/lab.ts`（必要に応じて）
