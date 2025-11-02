# Project Context

## Purpose

`LocaLabo` は九州工業大学 情報工学部 芹川・張・山脇・楊研究室向けの在室管理兼情報共有プラットフォームです。研究室メンバーが自身の在室・退室を記録し、ダッシュボードで状況を可視化しつつ、ブログ形式で研究活動やお知らせを公開できることを目指しています。

## Tech Stack

- Next.js 15（App Router）および React 19 によるフルスタック Web アプリケーション
- TypeScript 5 / ESLint 9 / Tailwind CSS 3 による型安全かつ一貫したフロントエンド開発
- Prisma ORM 6 + PostgreSQL（Neon 想定）によるデータアクセスレイヤー
- Clerk を用いた認証・ユーザー管理（SSO、メールリンクなど）
- Editor.js と Contentlayer2 を組み合わせたリッチテキストエディタと Markdown/MDX 生成
- TanStack Query 5、React Hook Form、Zod でのデータフェッチ・フォームバリデーション
- Vercel Blob、Next S3 Upload、Nodemailer などの周辺サービス連携

## Project Conventions

### Code Style

- TypeScript を基本とし、Next.js の ESLint 推奨設定（`eslint.config.mjs`）で静的解析を実施
- 可能な限り `async/await` を用いた読みやすい非同期コードを推奨
- パス解決は `@/*` エイリアス（`tsconfig.json`）を使用
- スタイルは Tailwind CSS のユーティリティクラスを中心に、複雑なパターンはコンポーネント抽象化
- 重要なロジックにのみ簡潔なコメントを追加し、過剰なコメントは避ける

### Architecture Patterns

- Next.js App Router 構成（`src/app` 配下）でルートグループを活用し、マーケティング向け / ダッシュボード向け / モバイル向けなどセクションごとに分離
- サーバーコンポーネントとクライアントコンポーネントを用途別に切り分け、`src/lib` 配下で Prisma や Clerk を利用したサーバーアクションを管理
- ダッシュボードやブログなど機能単位で `src/components` 下に UI コンポーネント群をモジュール化
- `src/config` にサイト設定、`src/hooks` にカスタムフック、`src/types` に共通型定義を配置して関心事を分離
- コンテンツ管理は Contentlayer を使い静的記事をビルド時に取り込み、動的投稿は Prisma + Editor.js で保存

### Testing Strategy

- 現時点で自動化テストは未整備のため、主要フローは開発者が手動で検証
- 回帰防止のため `npm run lint` を PR 前に実行し、ESLint エラーを解消してからマージ
- 重要機能については将来的に Playwright 等による E2E テスト導入を計画

### Git Workflow

- GitHub 上で `main` ブランチを安定版として維持し、機能開発は `feature/<topic>` ブランチを切って進行
- PR ベースでコードレビューを行い、Squash Merge を推奨（コミットメッセージは簡潔に日本語または英語で要点を記載）
- 破壊的変更や大規模対応は OpenSpec のプロポーザルを通して計画・レビューする

## Domain Context

- 研究室メンバーの在室状況をリアルタイムに把握し、履歴を可視化することが中心ユースケース
- ブログ/お知らせ機能で研究成果やイベント情報を学内外へ発信
- 研究室固有の祝祭日（祝日 API 利用）やラボ単位の出席ルールが存在し、UI も日本語を主とする

## Important Constraints

- Clerk・Vercel Blob などクラウドサービスの API キー管理が必須（`.env` にて運用）
- サーバレス環境（Vercel）を想定しており、Cold Start を考慮した軽量な Prisma クライアント管理が必要
- 個人情報（在室履歴・連絡先）を扱うためアクセス制御と監査ログの強化が望ましい
- 将来的な BLE 連携を念頭に、モバイルクライアントと連携しやすい API 設計を維持

## External Dependencies

- Clerk（認証・ユーザー管理）
- PostgreSQL（Prisma 経由の永続化。開発は `DATABASE_URL` で接続）
- Vercel Blob / S3 互換ストレージ（メディアアップロード）
- Nodemailer（メール通知）
- `@holiday-jp/holiday_jp`（日本の祝日計算）
- Vercel（ホスティング、CI/CD）
