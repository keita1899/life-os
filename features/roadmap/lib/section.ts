import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import { DB_COLUMNS } from '@/lib/db/constants'
import type {
  RoadmapSection,
  RoadmapSectionStatus,
  CreateRoadmapSectionInput,
  UpdateRoadmapSectionInput,
} from '../types/roadmap-section'

interface DbRoadmapSection {
  id: number
  name: string
  project_id: number
  sort_order: number
  status: string
  created_at: string
  updated_at: string
}

function mapDbToSection(db: DbRoadmapSection): RoadmapSection {
  return {
    id: db.id,
    name: db.name,
    projectId: db.project_id,
    sortOrder: db.sort_order,
    status: (db.status as RoadmapSectionStatus) ?? 'in_progress',
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

export async function getSectionsByProjectId(
  projectId: number,
): Promise<RoadmapSection[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbRoadmapSection[]>(
      `SELECT ${DB_COLUMNS.ROADMAP_SECTIONS.join(', ')} FROM roadmap_sections
       WHERE project_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [projectId],
    )

    return result.map(mapDbToSection)
  } catch (err) {
    handleDbError(err, 'get roadmap sections')
  }
}

export async function createRoadmapSection(
  input: CreateRoadmapSectionInput,
): Promise<RoadmapSection> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO roadmap_sections (name, project_id, sort_order)
       VALUES (?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM roadmap_sections WHERE project_id = ?))`,
      [input.name, input.projectId, input.projectId],
    )

    const result = await db.select<DbRoadmapSection[]>(
      `SELECT ${DB_COLUMNS.ROADMAP_SECTIONS.join(', ')} FROM roadmap_sections
       WHERE name = ? AND project_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [input.name, input.projectId],
    )

    if (result.length === 0) {
      throw new Error('Failed to create roadmap section: record not found after insert')
    }

    return mapDbToSection(result[0])
  } catch (err) {
    handleDbError(err, 'create roadmap section')
  }
}

const SECTION_UPDATE_MAPPING: FieldMapping<UpdateRoadmapSectionInput> = [
  { key: 'name', column: 'name' },
  { key: 'sortOrder', column: 'sort_order' },
  { key: 'status', column: 'status' },
]

export async function updateRoadmapSection(
  id: number,
  input: UpdateRoadmapSectionInput,
): Promise<RoadmapSection> {
  const db = await getDatabase()

  const params = buildUpdateParams(input, SECTION_UPDATE_MAPPING)

  if (params === null) {
    const result = await db.select<DbRoadmapSection[]>(
      `SELECT ${DB_COLUMNS.ROADMAP_SECTIONS.join(', ')} FROM roadmap_sections
       WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Roadmap section not found')
    }
    return mapDbToSection(result[0])
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE roadmap_sections SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbRoadmapSection[]>(
      `SELECT ${DB_COLUMNS.ROADMAP_SECTIONS.join(', ')} FROM roadmap_sections
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update roadmap section: record not found after update')
    }

    return mapDbToSection(result[0])
  } catch (err) {
    handleDbError(err, 'update roadmap section')
  }
}

export async function deleteRoadmapSection(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM roadmap_sections WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Roadmap section not found')
    }
  } catch (err) {
    handleDbError(err, 'delete roadmap section')
  }
}

export async function reorderRoadmapSections(
  updates: { id: number; sortOrder: number }[],
): Promise<void> {
  const db = await getDatabase()

  try {
    for (const { id, sortOrder } of updates) {
      await db.execute(
        'UPDATE roadmap_sections SET sort_order = ? WHERE id = ?',
        [sortOrder, id],
      )
    }
  } catch (err) {
    handleDbError(err, 'reorder roadmap sections')
  }
}
