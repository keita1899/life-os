import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration002: Migration = {
  version: 2,
  name: 'performance_indexes',
  up: async (db: Database) => {
    // tasks
    await db.execute('CREATE INDEX IF NOT EXISTS idx_tasks_execution_date ON tasks (execution_date)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks (completed)')

    // events
    await db.execute('CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events (start_datetime)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_events_category ON events (category)')

    // transactions (kakeibo)
    await db.execute('CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions (category_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_transaction_categories_type ON transaction_categories (type)')

    // habit_completions
    await db.execute('CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions (habit_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_date ON habit_completions (completed_date)')

    // daily_logs / dev_daily_logs
    await db.execute('CREATE INDEX IF NOT EXISTS idx_daily_logs_log_date ON daily_logs (log_date)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_dev_daily_logs_log_date ON dev_daily_logs (log_date)')

    // goals (year lookups)
    await db.execute('CREATE INDEX IF NOT EXISTS idx_yearly_goals_year ON yearly_goals (year)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_monthly_goals_year_month ON monthly_goals (year, month)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_weekly_goals_year ON weekly_goals (year)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_dev_yearly_goals_year ON dev_yearly_goals (year)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_dev_monthly_goals_year_month ON dev_monthly_goals (year, month)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_dev_weekly_goals_year ON dev_weekly_goals (year)')

    // subscriptions
    await db.execute('CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions (active, next_billing_date)')

    // dev_tasks
    await db.execute('CREATE INDEX IF NOT EXISTS idx_dev_tasks_execution_date ON dev_tasks (execution_date)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_dev_tasks_project_id ON dev_tasks (project_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_dev_tasks_type ON dev_tasks (type)')

    // bucket_list_items / wishlist_items / vision_items (category lookups)
    await db.execute('CREATE INDEX IF NOT EXISTS idx_bucket_list_items_category_id ON bucket_list_items (category_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_wishlist_items_category_id ON wishlist_items (category_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_vision_items_category_id ON vision_items (category_id)')
  },
}
