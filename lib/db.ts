import Database from '@tauri-apps/plugin-sql'
import { runMigrations } from './db/migration-runner'
import { allMigrations } from './db/migrations'

let db: Database | null = null
let dbPromise: Promise<Database> | null = null

export async function getDatabase(): Promise<Database> {
  if (db) return db

  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const database = await Database.load('sqlite:life-os.db')
        await runMigrations(database, allMigrations)
        db = database
        return database
      } catch (err) {
        dbPromise = null
        throw err
      }
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
