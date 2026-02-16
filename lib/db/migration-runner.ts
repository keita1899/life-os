import type Database from '@tauri-apps/plugin-sql'

export interface Migration {
  version: number
  name: string
  up: (db: Database) => Promise<void>
}

export async function runMigrations(
  db: Database,
  migrations: Migration[],
): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const applied = await db.select<{ version: number }[]>(
    'SELECT version FROM schema_migrations ORDER BY version ASC',
  )
  const appliedVersions = new Set(applied.map((r) => r.version))

  const sorted = [...migrations].sort((a, b) => a.version - b.version)

  for (const migration of sorted) {
    if (appliedVersions.has(migration.version)) continue

    console.log(
      `[DB] Running migration ${String(migration.version).padStart(3, '0')}: ${migration.name}`,
    )

    try {
      await migration.up(db)

      await db.execute(
        'INSERT INTO schema_migrations (version, name) VALUES (?, ?)',
        [migration.version, migration.name],
      )

      console.log(
        `[DB] Migration ${String(migration.version).padStart(3, '0')} complete`,
      )
    } catch (error) {
      console.error(
        `[DB] Migration ${String(migration.version).padStart(3, '0')} failed:`,
        error,
      )
      throw error
    }
  }
}
