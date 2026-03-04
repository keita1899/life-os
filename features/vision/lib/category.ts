import { getDatabase, handleDbError } from '@/lib/db'
import { buildUpdateParams, type FieldMapping } from '@/lib/db/build-update-params'
import { DB_COLUMNS } from '@/lib/db/constants'
import type {
  VisionCategory,
  CreateVisionCategoryInput,
  UpdateVisionCategoryInput,
} from '../types/vision-category'

interface DbVisionCategory {
  id: number
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

function mapDbVisionCategoryToVisionCategory(
  dbCategory: DbVisionCategory,
): VisionCategory {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    sortOrder: dbCategory.sort_order,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  const errorStr = String(err).toLowerCase()
  const errorMessage =
    err instanceof Error ? err.message.toLowerCase() : errorStr

  const hasUniqueConstraintFailed =
    errorMessage.includes('unique constraint failed') ||
    (errorMessage.includes('unique constraint') &&
      errorMessage.includes('failed')) ||
    errorStr.includes('unique constraint failed') ||
    (errorStr.includes('unique constraint') && errorStr.includes('failed'))

  const hasSqliteUniqueError =
    err instanceof Error &&
    (err.message.includes('2067') || errorMessage.includes('2067'))

  return hasUniqueConstraintFailed || hasSqliteUniqueError
}

export async function getAllVisionCategories(): Promise<VisionCategory[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbVisionCategory[]>(
      `SELECT ${DB_COLUMNS.VISION_CATEGORIES.join(', ')} FROM vision_categories
       ORDER BY sort_order ASC, id ASC`,
    )

    return result.map(mapDbVisionCategoryToVisionCategory)
  } catch (err) {
    handleDbError(err, 'get vision categories')
  }
}

export async function createVisionCategory(
  input: CreateVisionCategoryInput,
): Promise<VisionCategory> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO vision_categories (name, sort_order)
       VALUES (?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM vision_categories))`,
      [input.name],
    )

    const result = await db.select<DbVisionCategory[]>(
      `SELECT ${DB_COLUMNS.VISION_CATEGORIES.join(', ')} FROM vision_categories
       WHERE name = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [input.name],
    )

    if (result.length === 0) {
      throw new Error('Failed to create vision category: record not found after insert')
    }

    return mapDbVisionCategoryToVisionCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`「${input.name}」という名前のカテゴリーは既に存在します`)
    }

    handleDbError(err, 'create vision category')
  }
}

const VISION_CATEGORY_UPDATE_MAPPING: FieldMapping<UpdateVisionCategoryInput> = [
  { key: 'name', column: 'name' },
  { key: 'sortOrder', column: 'sort_order' },
]

export async function updateVisionCategory(
  id: number,
  input: UpdateVisionCategoryInput,
): Promise<VisionCategory> {
  const db = await getDatabase()

  const params = buildUpdateParams(input, VISION_CATEGORY_UPDATE_MAPPING)

  if (params === null) {
    try {
      const result = await db.select<DbVisionCategory[]>(
        `SELECT ${DB_COLUMNS.VISION_CATEGORIES.join(', ')} FROM vision_categories
         WHERE id = ?`,
        [id],
      )
      if (result.length === 0) {
        throw new Error('Vision category not found')
      }
      return mapDbVisionCategoryToVisionCategory(result[0])
    } catch (err) {
      handleDbError(err, 'update vision category')
    }
  }

  params.values.push(id)

  try {
    await db.execute(
      `UPDATE vision_categories SET ${params.fields.join(', ')} WHERE id = ?`,
      params.values,
    )

    const result = await db.select<DbVisionCategory[]>(
      `SELECT ${DB_COLUMNS.VISION_CATEGORIES.join(', ')} FROM vision_categories
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update vision category: record not found after update')
    }

    return mapDbVisionCategoryToVisionCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const categoryName = input.name || ''
      throw new Error(`「${categoryName}」という名前のカテゴリーは既に存在します`)
    }

    handleDbError(err, 'update vision category')
  }
}

export async function deleteVisionCategory(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM vision_categories WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Vision category not found')
    }
  } catch (err) {
    handleDbError(err, 'delete vision category')
  }
}

export async function reorderVisionCategories(
  updates: { id: number; sortOrder: number }[],
): Promise<void> {
  const db = await getDatabase()

  try {
    for (const { id, sortOrder } of updates) {
      await db.execute(
        'UPDATE vision_categories SET sort_order = ? WHERE id = ?',
        [sortOrder, id],
      )
    }
  } catch (err) {
    handleDbError(err, 'reorder vision categories')
  }
}
