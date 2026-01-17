import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null
let dbPromise: Promise<Database> | null = null

async function initializeAllTables(): Promise<void> {
  if (!db) return

  await db.execute(`
    CREATE TABLE IF NOT EXISTS yearly_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      target_date DATE,
      year INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS monthly_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      target_date DATE,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
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
      estimated_time INTEGER,
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

  // Migrate existing databases: remove recurrence columns and add category if needed
  try {
    // Check if recurrence columns exist (old schema)
    const tableInfo = await db.select<{ name: string }[]>(
      "SELECT name FROM pragma_table_info('events') WHERE name IN ('recurrence_type', 'recurrence_end_date', 'recurrence_count', 'recurrence_days_of_week')",
    )

    if (tableInfo.length > 0) {
      try {
        await db.execute('BEGIN TRANSACTION')

        // Create new table without recurrence columns
        await db.execute(`
          CREATE TABLE IF NOT EXISTS events_new (
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

        // Copy data from old table to new table
        await db.execute(`
          INSERT INTO events_new (id, title, start_datetime, end_datetime, all_day, category, description, created_at, updated_at)
          SELECT id, title, start_datetime, end_datetime, all_day, category, description, created_at, updated_at
          FROM events
        `)

        // Drop old table and rename new table
        await db.execute('DROP TABLE events')
        await db.execute('ALTER TABLE events_new RENAME TO events')

        await db.execute('COMMIT')
      } catch (err) {
        await db.execute('ROLLBACK')
        throw err
      }
    } else {
      // Just add category column if it doesn't exist
      try {
        await db.execute(`ALTER TABLE events ADD COLUMN category TEXT`)
      } catch {
        // Column already exists, ignore error
      }
    }
  } catch {
    // Migration failed, ignore error (table might not exist yet)
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
  throw new Error(`Failed to ${operation}: unknown error`)
}
