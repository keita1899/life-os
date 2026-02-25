# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

Life OS は **Tauri v2** (Rust バックエンド) + **Next.js 16** (React 19 フロントエンド) で構築されたデスクトップ個人ライフ管理アプリ。静的エクスポートモードのため、すべてのコンポーネントは Client Components として動作する。Server Components やサーバーサイドデータフェッチは使用不可。データは Tauri SQL プラグイン経由で **SQLite** に保存。

## コマンド

- `npm run dev` — Next.js 開発サーバー起動（フロントエンドのみ）
- `npm run build` — プロダクションビルド（`out/` に静的エクスポート）
- `npm run lint` — ESLint
- `npm run tauri dev` — Tauri デスクトップアプリを開発モードで起動
- `npm run tauri build` — Tauri デスクトップアプリのプロダクションビルド

## アーキテクチャ

### 技術スタック

- **フロントエンド**: Next.js 16 App Router (静的エクスポート)、React 19、TypeScript 5、Tailwind CSS 4
- **UI コンポーネント**: shadcn/ui (Radix UI プリミティブ)、Lucide アイコン
- **状態管理/データ**: SWR（キャッシュ・データフェッチ）、React Hook Form + Zod（フォーム・バリデーション）
- **バックエンド**: Tauri v2 (Rust) — `@tauri-apps/api/core` の `invoke` で IPC コマンド呼び出し
- **データベース**: SQLite（`@tauri-apps/plugin-sql` 経由）
- **パスエイリアス**: `@/*` がプロジェクトルートにマッピング

### 機能ベースのディレクトリ構成

`features/` 配下の各ドメイン機能は自己完結型:
```
features/<name>/
  components/   — UI コンポーネント
  hooks/        — SWR ベースのデータフック（例: useTasks）
  lib/          — ビジネスロジック、DB クエリ（fetch/create/update/delete）
  types/        — TypeScript 型定義
  index.ts      — 公開 API（再エクスポート）
```

機能一覧: `tasks`, `events`, `habits`, `goals`, `calendar`, `review`, `bucket-list`, `wishlist`, `subscriptions`, `vision`, `focus`, `logs`, `kakeibo`（家計簿）, `notifications`, `settings`、および `dev/` サブ機能（`projects`, `memos`, `tasks`, `requirements`）

### データフローパターン

1. **DB クエリ**は `features/<name>/lib/` に配置 — Tauri SQL プラグイン経由で SQLite を呼び出す
2. **フック**（`features/<name>/hooks/`）がクエリを SWR でラップしてキャッシュ・再検証を管理
3. **コンポーネント**がフックを利用して UI を制御
4. **SWR キー**は `lib/swr-keys.ts` に一元管理（Single Source of Truth）
5. キャッシュ無効化は SWR の `mutate()` と `SWR_KEYS` のキーを使用

### データベース

- スキーマは `lib/db/constants.ts` の `SCHEMA` オブジェクトで定義（テーブル名・カラム名の Single Source of Truth）
- マイグレーションは `lib/db/migrations/` に番号付き（`001_` 〜 `008_`）で配置し、`lib/db/migrations/index.ts` で登録
- マイグレーションランナーは `lib/db/migration-runner.ts`
- 新しいマイグレーション追加手順: `lib/db/migrations/NNN_<name>.ts` を作成 → `index.ts` の `allMigrations` 配列に追加 → `constants.ts` の `SCHEMA` を更新

### Tauri バックエンド

- エントリーポイント: `src-tauri/src/lib.rs`
- 権限設定: `src-tauri/capabilities/default.json`
- Tauri コマンドは `#[tauri::command]` で `snake_case` 命名
- プラグイン: SQL, Notifications, Log

### 共有ユーティリティ

- `lib/utils.ts` — `cn()`（clsx + tailwind-merge）
- `lib/date/` — 日付フォーマットヘルパー（`getTodayDateString` 等）
- `lib/markdown-shared.ts` — マークダウン用の共有 remark/rehype プラグインと Tailwind クラス
- `components/ui/` — shadcn/ui コンポーネント（ここだけ `kebab-case` ファイル名も許可）
- `hooks/` — 共有フック: `useDialogState`, `useAsyncOperation`, `useAppMode`, `useFormSubmitShortcut` 等

### アプリモード

`useAppMode` で切り替え可能な2つのモード: **life** モード（タスク、イベント、習慣、目標など）と **dev** モード（プロジェクト、開発タスク、メモ、要件定義）。モードに応じてサイドバーとナビゲーションが変わる。

## コーディング規約

- **言語**: 識別子はすべて英語（ローマ字禁止）。コメントと UI テキストは日本語
- **命名**: 変数・関数は camelCase、型・コンポーネントは PascalCase、定数は SCREAMING_SNAKE_CASE。Rust は snake_case
- **動詞プレフィックス**: `fetch`（外部データ取得）、`get`（単純な取得）、`find`（nullable な検索）、`create`/`update`/`delete`（CRUD）、`handle`（イベントハンドラ）、`calc`/`compute`（計算処理）
- **Props 型**: `ComponentNameProps` の命名規則
- **`any` 禁止**: 代わりに `unknown` と型ガードを使用
- **`interface` 優先**: 拡張可能な型には `interface`、ユニオン型には `type` を使用
- **早期リターン**でネストを浅く保つ
- **Tailwind のみ**でスタイリング — カスタム CSS クラスは作らない。条件付きクラスには `cn()` を使用
- **静的エクスポートの制約**: `next/image` 最適化不可、Server Components 不可、`generateMetadata` 不可。画像は標準の `<img>` タグを使用
- **テスト**: Vitest、テストファイルはソースと同じディレクトリに配置（`*.test.ts`/`*.test.tsx`）、`@testing-library/react` 使用、Tauri コマンドは `@tauri-apps/api` をモック
