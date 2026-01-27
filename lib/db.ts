import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null
let dbPromise: Promise<Database> | null = null

async function initializeAllTables(): Promise<void> {
  if (!db) return

  await db.execute(`
    CREATE TABLE IF NOT EXISTS yearly_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      achieved INTEGER NOT NULL DEFAULT 0,
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
      actual_time INTEGER NOT NULL DEFAULT 0,
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
      FOREIGN KEY (category_id) REFERENCES vision_categories(id) ON DELETE SET NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      target_year INTEGER,
      price INTEGER,
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
    CREATE TABLE IF NOT EXISTS dev_yearly_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      achieved INTEGER NOT NULL DEFAULT 0,
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

  const taskColumnRows = await db.select<{ name: string }[]>(
    "SELECT name FROM pragma_table_info('tasks')",
  )
  const taskColumns = new Set(taskColumnRows.map((r) => r.name))

  if (taskColumns.has('estimated_time')) {
    await db.execute('ALTER TABLE tasks RENAME TO tasks_old')

    await db.execute(`
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        execution_date DATE,
        completed INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        actual_time INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(
      `INSERT INTO tasks (
        id,
        title,
        execution_date,
        completed,
        "order",
        actual_time,
        created_at,
        updated_at
      )
      SELECT
        id,
        title,
        execution_date,
        completed,
        "order",
        actual_time,
        created_at,
        updated_at
      FROM tasks_old`,
    )

    await db.execute('DROP TABLE tasks_old')
  }

  const wishlistItemColumnRows = await db.select<{ name: string }[]>(
    "SELECT name FROM pragma_table_info('wishlist_items')",
  )
  const wishlistItemColumns = new Set(wishlistItemColumnRows.map((r) => r.name))

  if (wishlistItemColumns.has('purchased')) {
    await db.execute('ALTER TABLE wishlist_items RENAME TO wishlist_items_old')

    await db.execute(`
      CREATE TABLE wishlist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        target_year INTEGER,
        price INTEGER,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES wishlist_categories(id) ON DELETE SET NULL
      )
    `)

    await db.execute(
      `INSERT INTO wishlist_items (
        id,
        name,
        category_id,
        target_year,
        price,
        "order",
        created_at,
        updated_at
      )
      SELECT
        id,
        name,
        category_id,
        target_year,
        price,
        "order",
        created_at,
        updated_at
      FROM wishlist_items_old`,
    )

    await db.execute('DROP TABLE wishlist_items_old')
  }

  const devTaskColumnRows = await db.select<{ name: string }[]>(
    "SELECT name FROM pragma_table_info('dev_tasks')",
  )
  const devTaskColumns = new Set(devTaskColumnRows.map((r) => r.name))

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
        created_at,
        updated_at
      FROM dev_tasks_old`,
    )

    await db.execute('DROP TABLE dev_tasks_old')
  }

  if (!devTaskColumns.has('type')) {
    await db.execute(
      "ALTER TABLE dev_tasks ADD COLUMN type TEXT NOT NULL DEFAULT 'inbox'",
    )
  }

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
        id,
        title,
        year,
        achieved,
        created_at,
        updated_at
      )
      SELECT
        id,
        title,
        year,
        achieved,
        created_at,
        updated_at
      FROM yearly_goals_old`,
    )

    await db.execute('DROP TABLE yearly_goals_old')
  }

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
        id,
        title,
        year,
        month,
        achieved,
        created_at,
        updated_at
      )
      SELECT
        id,
        title,
        year,
        month,
        achieved,
        created_at,
        updated_at
      FROM monthly_goals_old`,
    )

    await db.execute('DROP TABLE monthly_goals_old')
  }

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
        id,
        title,
        year,
        achieved,
        created_at,
        updated_at
      )
      SELECT
        id,
        title,
        year,
        achieved,
        created_at,
        updated_at
      FROM dev_yearly_goals_old`,
    )

    await db.execute('DROP TABLE dev_yearly_goals_old')
  }

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
        id,
        title,
        year,
        month,
        achieved,
        created_at,
        updated_at
      )
      SELECT
        id,
        title,
        year,
        month,
        achieved,
        created_at,
        updated_at
      FROM dev_monthly_goals_old`,
    )

    await db.execute('DROP TABLE dev_monthly_goals_old')
  }
}

export async function getDatabase(): Promise<Database> {
  if (db) return db

  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await Database.load('sqlite:life-os.db')
      db = database
      await initializeAllTables()
      return database
    })()
  }

  return dbPromise
}

export function handleDbError(err: unknown, operation: string): never {
  if (err instanceof Error) {
    if (err.message.startsWith('Failed to ')) {
      throw err
    }
    throw new Error(`Failed to ${operation}: ${err.message}`)
  }
  throw new Error(`Failed to ${operation}: ${String(err)}`)
}
