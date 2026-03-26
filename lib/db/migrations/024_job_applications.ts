import type { Migration } from '../migration-runner'

export const migration024: Migration = {
  version: 25,
  name: 'job_applications',
  up: async (db) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'interested',
        url TEXT,
        applied_date TEXT,
        notes TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status)
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS job_interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
        round INTEGER NOT NULL DEFAULT 1,
        interview_type TEXT NOT NULL DEFAULT 'interview',
        scheduled_date TEXT,
        scheduled_time TEXT,
        location TEXT,
        notes TEXT,
        result TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_job_interviews_application_id ON job_interviews(application_id)
    `)
  },
}
