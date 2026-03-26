import type { Migration } from '../migration-runner'

export const migration025: Migration = {
  version: 26,
  name: 'roadmap_section_status',
  up: async (db) => {
    await db.execute(`
      ALTER TABLE roadmap_sections ADD COLUMN status TEXT NOT NULL DEFAULT 'in_progress'
    `)
  },
}
