import type { Migration } from '../migration-runner'

export const migration023: Migration = {
  version: 24,
  name: 'roadmap',
  up: async (db) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS roadmap_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS roadmap_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        project_id INTEGER NOT NULL REFERENCES roadmap_projects(id) ON DELETE CASCADE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_roadmap_sections_project_id ON roadmap_sections(project_id)
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS roadmap_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        project_id INTEGER NOT NULL REFERENCES roadmap_projects(id) ON DELETE CASCADE,
        section_id INTEGER DEFAULT NULL REFERENCES roadmap_sections(id) ON DELETE SET NULL,
        target_year INTEGER DEFAULT NULL,
        target_month INTEGER DEFAULT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        achieved_date TEXT DEFAULT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_project_id ON roadmap_tasks(project_id)
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_section_id ON roadmap_tasks(section_id)
    `)
  },
}
