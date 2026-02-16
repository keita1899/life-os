import type Database from '@tauri-apps/plugin-sql'
import type { Migration } from '../migration-runner'

export const migration001: Migration = {
  version: 1,
  name: 'initial_schema',
  up: async (db: Database) => {
    // ── Life tables ──

    await db.execute(`
      CREATE TABLE IF NOT EXISTS yearly_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        achieved INTEGER NOT NULL DEFAULT 0,
        checklist TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS monthly_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        achieved INTEGER NOT NULL DEFAULT 0,
        checklist TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS weekly_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        week_start_date DATE NOT NULL,
        achieved INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(year, week_start_date)
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        execution_date DATE,
        completed INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        scheduled_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME,
        all_day INTEGER NOT NULL DEFAULT 0,
        category TEXT,
        description TEXT,
        recurrence_rule TEXT,
        recurrence_end_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        birthday DATE,
        default_calendar_view TEXT DEFAULT 'month',
        week_start_day INTEGER DEFAULT 0,
        morning_review_time TIME,
        evening_review_time TIME,
        barcelona_ical_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS bucket_list_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS bucket_list_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category_id INTEGER,
        target_year INTEGER,
        target_month INTEGER,
        achieved_date DATE,
        completed INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES bucket_list_categories(id) ON DELETE SET NULL
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS wishlist_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS vision_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS vision_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category_id INTEGER,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES vision_categories(id) ON DELETE CASCADE
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        target_year INTEGER,
        target_month INTEGER,
        price INTEGER,
        purchased INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES wishlist_categories(id) ON DELETE SET NULL
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        monthly_price INTEGER NOT NULL,
        billing_cycle TEXT NOT NULL,
        next_billing_date DATE NOT NULL,
        start_date DATE,
        cancellation_url TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_date DATE NOT NULL UNIQUE,
        diary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        scheduled_time TEXT,
        frequency_type TEXT NOT NULL,
        frequency_days TEXT,
        frequency_day_of_month INTEGER,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS habit_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        completed_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, completed_date),
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS transaction_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(type, name)
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        category_id INTEGER,
        is_fixed INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ── Dev tables ──

    await db.execute(`
      CREATE TABLE IF NOT EXISTS dev_daily_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_date DATE NOT NULL UNIQUE,
        report TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS dev_yearly_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        achieved INTEGER NOT NULL DEFAULT 0,
        checklist TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(year)
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS dev_monthly_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        achieved INTEGER NOT NULL DEFAULT 0,
        checklist TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(year, month)
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS dev_weekly_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        week_start_date DATE NOT NULL,
        achieved INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(year, week_start_date)
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS dev_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS dev_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        project_id INTEGER,
        type TEXT NOT NULL DEFAULT 'inbox',
        execution_date DATE,
        completed INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        actual_time INTEGER NOT NULL DEFAULT 0,
        memo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES dev_projects(id) ON DELETE SET NULL
      )
    `)

    await db.execute(
      'CREATE UNIQUE INDEX IF NOT EXISTS dev_tasks_order_unique_null ON dev_tasks (type, "order") WHERE project_id IS NULL',
    )
    await db.execute(
      'CREATE UNIQUE INDEX IF NOT EXISTS dev_tasks_order_unique_notnull ON dev_tasks (project_id, type, "order") WHERE project_id IS NOT NULL',
    )

    // ── Legacy schema migrations (idempotent) ──

    // tasks: rename actual_time → estimated_time → scheduled_time
    const taskColumnRows = await db.select<
      { cid: number; name: string; type: string; notnull: number; dflt_value: string | null; pk: number }[]
    >("SELECT * FROM pragma_table_info('tasks')")
    const taskColumns = new Set(taskColumnRows.map((r) => r.name))
    const scheduledTimeColumn = taskColumnRows.find(
      (r) => r.name === 'scheduled_time',
    )

    if (taskColumns.has('actual_time') && !taskColumns.has('estimated_time') && !taskColumns.has('scheduled_time')) {
      await db.execute('ALTER TABLE tasks RENAME COLUMN actual_time TO estimated_time')
    }

    if (taskColumns.has('estimated_time') && !taskColumns.has('scheduled_time')) {
      await db.execute('ALTER TABLE tasks RENAME COLUMN estimated_time TO scheduled_time')
    }

    if (!taskColumns.has('scheduled_time')) {
      await db.execute('ALTER TABLE tasks ADD COLUMN scheduled_time TEXT')
    } else if (
      scheduledTimeColumn &&
      scheduledTimeColumn.notnull === 1
    ) {
      const hasMemo = taskColumns.has('memo')
      try {
        await db.execute('ALTER TABLE tasks RENAME TO tasks_old')
        await db.execute(`
          CREATE TABLE tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            execution_date DATE,
            completed INTEGER NOT NULL DEFAULT 0,
            "order" INTEGER NOT NULL DEFAULT 0,
            scheduled_time TEXT,
            recurrence_rule TEXT,
            recurrence_days_of_week TEXT,
            recurrence_day_of_month INTEGER,
            recurrence_end_date TEXT,
            recurrence_excluded_dates TEXT,
            ${hasMemo ? 'memo TEXT,' : ''}
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `)
        await db.execute(`
          INSERT INTO tasks (
            id, title, execution_date, completed, "order", scheduled_time,
            recurrence_rule, recurrence_days_of_week, recurrence_day_of_month,
            recurrence_end_date, recurrence_excluded_dates${hasMemo ? ', memo' : ''}, created_at, updated_at
          )
          SELECT 
            id, title, execution_date, completed, "order", scheduled_time,
            recurrence_rule, recurrence_days_of_week, recurrence_day_of_month,
            recurrence_end_date, recurrence_excluded_dates${hasMemo ? ', memo' : ''}, created_at, updated_at
          FROM tasks_old
        `)
        await db.execute('DROP TABLE tasks_old')
      } catch (err) {
        const oldTableExists = await db.select<{ name: string }[]>(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='tasks_old'",
        )
        if (oldTableExists.length > 0) {
          await db.execute('DROP TABLE IF EXISTS tasks')
          await db.execute('ALTER TABLE tasks_old RENAME TO tasks')
        }
        throw err
      }
    }

    // wishlist_items: add target_month, purchased
    const wishlistItemColumnRows = await db.select<{ name: string }[]>(
      "SELECT name FROM pragma_table_info('wishlist_items')",
    )
    const wishlistItemColumns = new Set(wishlistItemColumnRows.map((r) => r.name))

    if (!wishlistItemColumns.has('target_month')) {
      await db.execute(
        'ALTER TABLE wishlist_items ADD COLUMN target_month INTEGER',
      )
    }

    if (!wishlistItemColumns.has('purchased')) {
      await db.execute(
        'ALTER TABLE wishlist_items ADD COLUMN purchased INTEGER NOT NULL DEFAULT 0',
      )
    }

    // dev_tasks: rebuild if legacy columns exist
    const devTaskColumnRows = await db.select<{ name: string }[]>(
      "SELECT name FROM pragma_table_info('dev_tasks')",
    )
    const devTaskColumns = new Set(devTaskColumnRows.map((r) => r.name))

    let devTasksRebuilt = false
    if (devTaskColumns.has('category_id') || devTaskColumns.has('estimated_time')) {
      await db.execute('ALTER TABLE dev_tasks RENAME TO dev_tasks_old')

      await db.execute(`
        CREATE TABLE dev_tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          project_id INTEGER,
          type TEXT NOT NULL DEFAULT 'inbox',
          execution_date DATE,
          completed INTEGER NOT NULL DEFAULT 0,
          "order" INTEGER NOT NULL DEFAULT 0,
          actual_time INTEGER NOT NULL DEFAULT 0,
          memo TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES dev_projects(id) ON DELETE SET NULL
        )
      `)

      await db.execute(
        'CREATE UNIQUE INDEX IF NOT EXISTS dev_tasks_order_unique_null ON dev_tasks (type, "order") WHERE project_id IS NULL',
      )
      await db.execute(
        'CREATE UNIQUE INDEX IF NOT EXISTS dev_tasks_order_unique_notnull ON dev_tasks (project_id, type, "order") WHERE project_id IS NOT NULL',
      )

      const hasTypeInOld = devTaskColumns.has('type')
      const typeSelect = hasTypeInOld ? 'type' : "'inbox' as type"

      await db.execute(
        `INSERT INTO dev_tasks (
          id,
          title,
          project_id,
          type,
          execution_date,
          completed,
          "order",
          actual_time,
          memo,
          created_at,
          updated_at
        )
        SELECT
          id,
          title,
          project_id,
          ${typeSelect},
          execution_date,
          completed,
          "order",
          actual_time,
          NULL as memo,
          created_at,
          updated_at
        FROM dev_tasks_old`,
      )

      await db.execute('DROP TABLE dev_tasks_old')
      devTasksRebuilt = true
    }

    if (!devTasksRebuilt && !devTaskColumns.has('type')) {
      await db.execute(
        "ALTER TABLE dev_tasks ADD COLUMN type TEXT NOT NULL DEFAULT 'inbox'",
      )
    }

    if (!devTasksRebuilt && !devTaskColumns.has('memo')) {
      await db.execute('ALTER TABLE dev_tasks ADD COLUMN memo TEXT')
    }

    // yearly_goals: remove target_date
    const yearlyGoalColumnRows = await db.select<{ name: string }[]>(
      "SELECT name FROM pragma_table_info('yearly_goals')",
    )
    const yearlyGoalColumns = new Set(yearlyGoalColumnRows.map((r) => r.name))

    if (yearlyGoalColumns.has('target_date')) {
      await db.execute('ALTER TABLE yearly_goals RENAME TO yearly_goals_old')

      await db.execute(`
        CREATE TABLE yearly_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          year INTEGER NOT NULL,
          achieved INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await db.execute(
        `INSERT INTO yearly_goals (
          id, title, year, achieved, created_at, updated_at
        )
        SELECT
          id, title, year, achieved, created_at, updated_at
        FROM yearly_goals_old`,
      )

      await db.execute('DROP TABLE yearly_goals_old')
    }

    // monthly_goals: remove target_date
    const monthlyGoalColumnRows = await db.select<{ name: string }[]>(
      "SELECT name FROM pragma_table_info('monthly_goals')",
    )
    const monthlyGoalColumns = new Set(monthlyGoalColumnRows.map((r) => r.name))

    if (monthlyGoalColumns.has('target_date')) {
      await db.execute('ALTER TABLE monthly_goals RENAME TO monthly_goals_old')

      await db.execute(`
        CREATE TABLE monthly_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          year INTEGER NOT NULL,
          month INTEGER NOT NULL,
          achieved INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await db.execute(
        `INSERT INTO monthly_goals (
          id, title, year, month, achieved, created_at, updated_at
        )
        SELECT
          id, title, year, month, achieved, created_at, updated_at
        FROM monthly_goals_old`,
      )

      await db.execute('DROP TABLE monthly_goals_old')
    }

    // dev_yearly_goals: remove target_date
    const devYearlyGoalColumnRows = await db.select<{ name: string }[]>(
      "SELECT name FROM pragma_table_info('dev_yearly_goals')",
    )
    const devYearlyGoalColumns = new Set(devYearlyGoalColumnRows.map((r) => r.name))

    if (devYearlyGoalColumns.has('target_date')) {
      await db.execute('ALTER TABLE dev_yearly_goals RENAME TO dev_yearly_goals_old')

      await db.execute(`
        CREATE TABLE dev_yearly_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          year INTEGER NOT NULL,
          achieved INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(year)
        )
      `)

      await db.execute(
        `INSERT INTO dev_yearly_goals (
          id, title, year, achieved, created_at, updated_at
        )
        SELECT
          id, title, year, achieved, created_at, updated_at
        FROM dev_yearly_goals_old`,
      )

      await db.execute('DROP TABLE dev_yearly_goals_old')
    }

    // vision_items: fix FK from SET NULL to CASCADE
    const visionItemFkRows = await db.select<
      { id: number; seq: number; table: string; from: string; to: string; on_update: string; on_delete: string }[]
    >("SELECT * FROM pragma_foreign_key_list('vision_items') WHERE \"from\" = 'category_id'")

    const hasSetNullFk = visionItemFkRows.some(
      (fk) => fk.on_delete === 'SET NULL' || fk.on_delete === 'set null'
    )

    if (hasSetNullFk) {
      await db.execute('ALTER TABLE vision_items RENAME TO vision_items_old')

      await db.execute(`
        CREATE TABLE vision_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          category_id INTEGER,
          "order" INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES vision_categories(id) ON DELETE CASCADE
        )
      `)

      await db.execute(
        `INSERT INTO vision_items (
          id, title, category_id, "order", created_at, updated_at
        )
        SELECT
          id, title, category_id, "order", created_at, updated_at
        FROM vision_items_old`,
      )

      await db.execute('DROP TABLE vision_items_old')
    }

    // dev_monthly_goals: remove target_date
    const devMonthlyGoalColumnRows = await db.select<{ name: string }[]>(
      "SELECT name FROM pragma_table_info('dev_monthly_goals')",
    )
    const devMonthlyGoalColumns = new Set(devMonthlyGoalColumnRows.map((r) => r.name))

    if (devMonthlyGoalColumns.has('target_date')) {
      await db.execute('ALTER TABLE dev_monthly_goals RENAME TO dev_monthly_goals_old')

      await db.execute(`
        CREATE TABLE dev_monthly_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          year INTEGER NOT NULL,
          month INTEGER NOT NULL,
          achieved INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(year, month)
        )
      `)

      await db.execute(
        `INSERT INTO dev_monthly_goals (
          id, title, year, month, achieved, created_at, updated_at
        )
        SELECT
          id, title, year, month, achieved, created_at, updated_at
        FROM dev_monthly_goals_old`,
      )

      await db.execute('DROP TABLE dev_monthly_goals_old')
    }

    // user_settings: add new columns
    const userSettingsColumnRows = await db.select<{ name: string }[]>(
      "SELECT name FROM pragma_table_info('user_settings')",
    )
    const userSettingsColumns = new Set(userSettingsColumnRows.map((r) => r.name))

    if (!userSettingsColumns.has('barcelona_ical_url')) {
      await db.execute(
        'ALTER TABLE user_settings ADD COLUMN barcelona_ical_url TEXT',
      )
    }

    if (!userSettingsColumns.has('initial_balance')) {
      await db.execute(
        'ALTER TABLE user_settings ADD COLUMN initial_balance INTEGER',
      )
    }

    if (!userSettingsColumns.has('default_habit_view')) {
      await db.execute(
        "ALTER TABLE user_settings ADD COLUMN default_habit_view TEXT DEFAULT 'month'",
      )
    }

    // events: add recurrence columns
    const eventsColumnRows = await db.select<{ name: string }[]>(
      "SELECT name FROM pragma_table_info('events')",
    )
    const eventsColumns = new Set(eventsColumnRows.map((r) => r.name))
    if (!eventsColumns.has('recurrence_rule')) {
      await db.execute(
        'ALTER TABLE events ADD COLUMN recurrence_rule TEXT',
      )
    }
    if (!eventsColumns.has('recurrence_end_date')) {
      await db.execute(
        'ALTER TABLE events ADD COLUMN recurrence_end_date TEXT',
      )
    }
    if (!eventsColumns.has('recurrence_day_of_week')) {
      await db.execute(
        'ALTER TABLE events ADD COLUMN recurrence_day_of_week INTEGER',
      )
    }
    if (!eventsColumns.has('recurrence_day_of_month')) {
      await db.execute(
        'ALTER TABLE events ADD COLUMN recurrence_day_of_month INTEGER',
      )
    }
    if (!eventsColumns.has('recurrence_days_of_week')) {
      await db.execute(
        'ALTER TABLE events ADD COLUMN recurrence_days_of_week TEXT',
      )
    }
    if (!eventsColumns.has('recurrence_excluded_dates')) {
      await db.execute(
        'ALTER TABLE events ADD COLUMN recurrence_excluded_dates TEXT',
      )
    }

    await db.execute(
      "UPDATE events SET category = 'barca' WHERE category = 'sports' AND title LIKE '%FC Barcelona%'",
    )

    // tasks: add recurrence columns
    const tasksColumnRows = await db.select<{ name?: string; NAME?: string }[]>(
      "SELECT name FROM pragma_table_info('tasks')",
    )
    const tasksColumns = new Set(
      tasksColumnRows.map((r) => r.name ?? r.NAME ?? ''),
    )
    if (!tasksColumns.has('recurrence_rule')) {
      await db.execute('ALTER TABLE tasks ADD COLUMN recurrence_rule TEXT')
    }
    if (!tasksColumns.has('recurrence_days_of_week')) {
      await db.execute('ALTER TABLE tasks ADD COLUMN recurrence_days_of_week TEXT')
    }
    if (!tasksColumns.has('recurrence_day_of_month')) {
      await db.execute(
        'ALTER TABLE tasks ADD COLUMN recurrence_day_of_month INTEGER',
      )
    }
    if (!tasksColumns.has('recurrence_end_date')) {
      await db.execute('ALTER TABLE tasks ADD COLUMN recurrence_end_date TEXT')
    }
    if (!tasksColumns.has('recurrence_excluded_dates')) {
      await db.execute('ALTER TABLE tasks ADD COLUMN recurrence_excluded_dates TEXT')
    }
    if (!tasksColumns.has('memo')) {
      await db.execute('ALTER TABLE tasks ADD COLUMN memo TEXT')
    }

    // bucket_list_items: add target_month
    try {
      const bucketListItemsColumnRows = await db.select<
        { name?: string; NAME?: string }[]
      >("SELECT name FROM pragma_table_info('bucket_list_items')")
      const names = bucketListItemsColumnRows.map(
        (r) => r.name ?? r.NAME ?? '',
      )
      const bucketListItemsColumns = new Set(names)
      if (!bucketListItemsColumns.has('target_month')) {
        await db.execute(
          'ALTER TABLE bucket_list_items ADD COLUMN target_month INTEGER',
        )
      }
    } catch {
      try {
        await db.execute(
          'ALTER TABLE bucket_list_items ADD COLUMN target_month INTEGER',
        )
      } catch (alterErr) {
        const msg = alterErr instanceof Error ? alterErr.message : String(alterErr)
        if (!msg.includes('duplicate column name')) {
          console.error('[DB] bucket_list_items target_month migration:', alterErr)
          throw alterErr
        }
      }
    }

    // goals: add checklist column
    try {
      const yg = await db.select<{ name: string }[]>(
        "SELECT name FROM pragma_table_info('yearly_goals')",
      )
      if (!new Set(yg.map((r) => r.name)).has('checklist')) {
        await db.execute('ALTER TABLE yearly_goals ADD COLUMN checklist TEXT')
      }
    } catch (alterErr) {
      const msg = alterErr instanceof Error ? alterErr.message : String(alterErr)
      if (!msg.includes('duplicate column name')) {
        console.error('[DB] yearly_goals checklist migration:', alterErr)
        throw alterErr
      }
    }

    try {
      const mg = await db.select<{ name: string }[]>(
        "SELECT name FROM pragma_table_info('monthly_goals')",
      )
      if (!new Set(mg.map((r) => r.name)).has('checklist')) {
        await db.execute('ALTER TABLE monthly_goals ADD COLUMN checklist TEXT')
      }
    } catch (alterErr) {
      const msg = alterErr instanceof Error ? alterErr.message : String(alterErr)
      if (!msg.includes('duplicate column name')) {
        console.error('[DB] monthly_goals checklist migration:', alterErr)
        throw alterErr
      }
    }

    try {
      const dyg = await db.select<{ name: string }[]>(
        "SELECT name FROM pragma_table_info('dev_yearly_goals')",
      )
      if (!new Set(dyg.map((r) => r.name)).has('checklist')) {
        await db.execute('ALTER TABLE dev_yearly_goals ADD COLUMN checklist TEXT')
      }
    } catch (alterErr) {
      const msg = alterErr instanceof Error ? alterErr.message : String(alterErr)
      if (!msg.includes('duplicate column name')) {
        console.error('[DB] dev_yearly_goals checklist migration:', alterErr)
        throw alterErr
      }
    }

    try {
      const dmg = await db.select<{ name: string }[]>(
        "SELECT name FROM pragma_table_info('dev_monthly_goals')",
      )
      if (!new Set(dmg.map((r) => r.name)).has('checklist')) {
        await db.execute('ALTER TABLE dev_monthly_goals ADD COLUMN checklist TEXT')
      }
    } catch (alterErr) {
      const msg = alterErr instanceof Error ? alterErr.message : String(alterErr)
      if (!msg.includes('duplicate column name')) {
        console.error('[DB] dev_monthly_goals checklist migration:', alterErr)
        throw alterErr
      }
    }

    // Cleanup leftover old tables
    const oldTableRows = await db.select<{ name: string }[]>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='transaction_categories_old'",
    )
    if (oldTableRows.length > 0) {
      await db.execute('DROP TABLE IF EXISTS transaction_categories_old')
    }
  },
}
