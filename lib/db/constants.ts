// ────────────────────────────────────────────
// Single Source of Truth: テーブルスキーマ定義
// カラムを追加・変更する場合はここだけを編集する
// ────────────────────────────────────────────

const SCHEMA = {
  events: [
    'id',
    'title',
    'start_datetime',
    'end_datetime',
    'all_day',
    'category',
    'description',
    'recurrence_rule',
    'recurrence_day_of_week',
    'recurrence_days_of_week',
    'recurrence_day_of_month',
    'recurrence_end_date',
    'recurrence_excluded_dates',
    'order',
    'created_at',
    'updated_at',
  ],
  tasks: [
    'id',
    'title',
    'execution_date',
    'completed',
    'order',
    'scheduled_time',
    'recurrence_rule',
    'recurrence_days_of_week',
    'recurrence_day_of_month',
    'recurrence_end_date',
    'recurrence_excluded_dates',
    'memo',
    'created_at',
    'updated_at',
  ],
  yearly_goals: [
    'id',
    'title',
    'year',
    'achieved',
    'checklist',
    'created_at',
    'updated_at',
  ],
  monthly_goals: [
    'id',
    'title',
    'year',
    'month',
    'achieved',
    'checklist',
    'created_at',
    'updated_at',
  ],
  weekly_goals: [
    'id',
    'title',
    'year',
    'week_start_date',
    'achieved',
    'created_at',
    'updated_at',
  ],
  user_settings: [
    'id',
    'birthday',
    'default_calendar_view',
    'week_start_day',
    'morning_review_time',
    'evening_review_time',
    'week_start_review_time',
    'week_end_review_time',
    'barcelona_ical_url',
    'initial_balance',
    'default_habit_view',
    'notify_events',
    'notify_tasks',
    'notify_habits',
    'notify_minutes_before',
    'life_weekday_themes',
    'dev_weekday_themes',
    'created_at',
    'updated_at',
  ],
  review_completions: [
    'id',
    'completed_date',
    'type',
    'mode',
    'completed_at',
  ],
  bucket_list_categories: [
    'id',
    'name',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  bucket_list_items: [
    'id',
    'title',
    'category_id',
    'target_year',
    'target_month',
    'achieved_date',
    'completed',
    'order',
    'created_at',
    'updated_at',
  ],
  wishlist_categories: [
    'id',
    'name',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  wishlist_items: [
    'id',
    'name',
    'category_id',
    'target_year',
    'target_month',
    'price',
    'purchased',
    'order',
    'created_at',
    'updated_at',
  ],
  subscriptions: [
    'id',
    'name',
    'monthly_price',
    'billing_cycle',
    'next_billing_date',
    'start_date',
    'cancellation_url',
    'active',
    'order',
    'created_at',
    'updated_at',
  ],
  daily_logs: [
    'id',
    'log_date',
    'diary',
    'created_at',
    'updated_at',
  ],
  habits: [
    'id',
    'name',
    'scheduled_time',
    'frequency_type',
    'frequency_days',
    'frequency_day_of_month',
    'order',
    'created_at',
    'updated_at',
  ],
  habit_completions: [
    'id',
    'habit_id',
    'completed_date',
    'created_at',
  ],
  transaction_categories: [
    'id',
    'type',
    'name',
    'created_at',
    'updated_at',
  ],
  transactions: [
    'id',
    'date',
    'type',
    'name',
    'amount',
    'category_id',
    'is_fixed',
    'created_at',
    'updated_at',
  ],
  // ── Dev tables ──
  dev_daily_logs: [
    'id',
    'log_date',
    'report',
    'created_at',
    'updated_at',
  ],
  dev_yearly_goals: [
    'id',
    'title',
    'year',
    'achieved',
    'checklist',
    'created_at',
    'updated_at',
  ],
  dev_monthly_goals: [
    'id',
    'title',
    'year',
    'month',
    'achieved',
    'checklist',
    'created_at',
    'updated_at',
  ],
  dev_weekly_goals: [
    'id',
    'title',
    'year',
    'week_start_date',
    'achieved',
    'created_at',
    'updated_at',
  ],
  dev_projects: [
    'id',
    'name',
    'start_date',
    'end_date',
    'status',
    'created_at',
    'updated_at',
  ],
  dev_memos: [
    'id',
    'title',
    'content',
    'project_id',
    'tags',
    'created_at',
    'updated_at',
  ],
  dev_tasks: [
    'id',
    'title',
    'project_id',
    'type',
    'execution_date',
    'completed',
    'order',
    'actual_time',
    'memo',
    'created_at',
    'updated_at',
  ],
  vision_categories: [
    'id',
    'name',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  vision_items: [
    'id',
    'title',
    'category_id',
    'order',
    'created_at',
    'updated_at',
  ],
  interview_categories: [
    'id',
    'name',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  interview_items: [
    'id',
    'question',
    'answer',
    'category_id',
    'order',
    'created_at',
    'updated_at',
  ],
  rule_categories: [
    'id',
    'name',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  rule_items: [
    'id',
    'title',
    'category_id',
    'order',
    'created_at',
    'updated_at',
  ],
  dev_project_db_designs: [
    'id',
    'project_id',
    'content',
    'updated_at',
  ],
  dev_project_readmes: [
    'id',
    'project_id',
    'content',
    'updated_at',
  ],
} as const

// ────────────────────────────────────────────
// 後方互換の DB_COLUMNS（SCHEMA から自動導出）
// ────────────────────────────────────────────

type UpperSnake<S extends string> =
  S extends `${infer A}_${infer B}`
    ? `${Uppercase<A>}_${UpperSnake<B>}`
    : Uppercase<S>

type DbColumns = {
  [K in keyof typeof SCHEMA as UpperSnake<K & string>]: (typeof SCHEMA)[K]
}

function toUpperSnake(s: string): string {
  return s.toUpperCase()
}

function buildDbColumns(): DbColumns {
  const result: Record<string, readonly string[]> = {}
  for (const [key, value] of Object.entries(SCHEMA)) {
    result[toUpperSnake(key)] = value
  }
  return result as DbColumns
}

export const DB_COLUMNS = buildDbColumns()

// Re-export SCHEMA for migration files and other uses
export { SCHEMA }
