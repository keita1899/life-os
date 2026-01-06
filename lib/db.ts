import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (db) return db
  db = await Database.load('sqlite:life-os.db')
  return db
}
