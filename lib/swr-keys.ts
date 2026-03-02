// ────────────────────────────────────────────
// SWR Keys — Single Source of Truth
// キーを追加・変更する場合はここだけを編集する
// ────────────────────────────────────────────

export const SWR_KEYS = {
  // ── Life ──
  tasks: 'tasks',
  events: 'events',
  habits: 'habits',
  habitCompletionsByDate: (date: string) =>
    ['habit-completions-by-date', date] as const,
  habitCompletionsByMonth: (habitId: number, year: number, month: number) =>
    ['habit-completions', habitId, year, month] as const,
  habitCompletionsByDateRange: (
    habitId: number,
    startDate: string,
    endDate: string,
  ) => ['habit-completions-range', habitId, startDate, endDate] as const,
  goals: (year: number) => ['goals', year] as const,
  dailyLog: (logDate: string) => ['daily-log', logDate] as const,
  bucketList: 'bucket-list',
  bucketListCategories: 'bucket-list-categories',
  wishlist: 'wishlist',
  wishlistCategories: 'wishlist-categories',
  subscriptions: 'subscriptions',
  vision: 'vision',
  visionCategories: 'vision-categories',
  userSettings: 'user-settings',
  reviewCompletion: (completedDate: string, type: string, mode: string) =>
    ['review-completion', completedDate, type, mode] as const,

  // ── Kakeibo ──
  transactions: 'transactions',
  transactionsByMonth: (year: number, month: number) =>
    `transactions-${year}-${month}` as const,
  transactionsByDateRange: (startDate: string, endDate: string) =>
    `transactions-range-${startDate}-${endDate}` as const,
  transactionCategories: (type: string) =>
    `transaction-categories-${type}` as const,

  // ── Dev ──
  devGoals: (year: number) => ['dev-goals', year] as const,
  devProjects: 'dev-projects',
  devProject: (projectId: number) => `dev-project-${projectId}` as const,
  devTasks: 'dev-calendar-tasks',
  devTasksByProject: (projectId: number | null, type: string) =>
    ['dev-tasks', projectId, type] as const,
  devDailyLog: (logDate: string) => ['dev-daily-log', logDate] as const,
  devMemos: 'dev-memos',
  devMemosWithKeyword: (keyword: string) =>
    `dev-memos-keyword-${keyword}` as const,
  devMemosWithOrder: (baseKey: string, orderBy: string) =>
    `${baseKey}-${orderBy}` as const,
  devMemosByProject: (projectId: number) =>
    ['dev-memos-by-project', projectId] as const,
  devMemo: (id: number) => `dev-memo-${id}` as const,
  devProjectRequirements: (projectId: number) =>
    `dev-project-requirements-${projectId}` as const,

  // ── Interview ──
  interviewItems: 'interview-items',
  interviewCategories: 'interview-categories',
} as const

export function isTransactionsRelatedKey(key: unknown): boolean {
  return typeof key === 'string' && key.startsWith('transactions-')
}
