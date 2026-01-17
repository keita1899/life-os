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
