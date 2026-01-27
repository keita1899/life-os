import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type {
  VisionCategory,
  CreateVisionCategoryInput,
  UpdateVisionCategoryInput,
} from '../types/vision-category'

interface DbVisionCategory {
  id: number
  name: string
  created_at: string
  updated_at: string
}

function mapDbVisionCategoryToVisionCategory(
  dbCategory: DbVisionCategory,
): VisionCategory {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  const errorStr = String(err).toLowerCase()
  const errorMessage =
    err instanceof Error ? err.message.toLowerCase() : errorStr

  return (
    errorMessage.includes('unique') ||
    errorMessage.includes('constraint') ||
    errorStr.includes('unique') ||
    errorStr.includes('constraint') ||
    (err instanceof Error &&
      (err.message.includes('19') || err.message.includes('2067')))
  )
}

export async function getAllVisionCategories(): Promise<VisionCategory[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbVisionCategory[]>(
      `SELECT ${DB_COLUMNS.VISION_CATEGORIES.join(', ')} FROM vision_categories
       ORDER BY name ASC`,
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
      `INSERT INTO vision_categories (name)
       VALUES (?)`,
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

export async function updateVisionCategory(
  id: number,
  input: UpdateVisionCategoryInput,
): Promise<VisionCategory> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.name !== undefined) {
    updateFields.push('name = ?')
    updateValues.push(input.name)
  }

  if (updateFields.length === 0) {
    const result = await db.select<DbVisionCategory[]>(
      `SELECT ${DB_COLUMNS.VISION_CATEGORIES.join(', ')} FROM vision_categories
       WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Vision category not found')
    }
    return mapDbVisionCategoryToVisionCategory(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE vision_categories SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
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
