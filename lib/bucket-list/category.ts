import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type {
  BucketListCategory,
  CreateBucketListCategoryInput,
  UpdateBucketListCategoryInput,
} from '../types/bucket-list-category'

interface DbBucketListCategory {
  id: number
  name: string
  created_at: string
  updated_at: string
}

function mapDbBucketListCategoryToBucketListCategory(
  dbCategory: DbBucketListCategory,
): BucketListCategory {
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

export async function getAllBucketListCategories(): Promise<BucketListCategory[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbBucketListCategory[]>(
      `SELECT ${DB_COLUMNS.BUCKET_LIST_CATEGORIES.join(', ')} FROM bucket_list_categories
       ORDER BY name ASC`,
    )

    return result.map(mapDbBucketListCategoryToBucketListCategory)
  } catch (err) {
    handleDbError(err, 'get bucket list categories')
  }
}

export async function createBucketListCategory(
  input: CreateBucketListCategoryInput,
): Promise<BucketListCategory> {
  const db = await getDatabase()

  try {
    await db.execute(
      `INSERT INTO bucket_list_categories (name)
       VALUES (?)`,
      [input.name],
    )

    const result = await db.select<DbBucketListCategory[]>(
      `SELECT ${DB_COLUMNS.BUCKET_LIST_CATEGORIES.join(', ')} FROM bucket_list_categories
       WHERE name = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [input.name],
    )

    if (result.length === 0) {
      throw new Error('Failed to create bucket list category: record not found after insert')
    }

    return mapDbBucketListCategoryToBucketListCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error(`「${input.name}」という名前のカテゴリーは既に存在します`)
    }

    handleDbError(err, 'create bucket list category')
  }
}

export async function updateBucketListCategory(
  id: number,
  input: UpdateBucketListCategoryInput,
): Promise<BucketListCategory> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.name !== undefined) {
    updateFields.push('name = ?')
    updateValues.push(input.name)
  }

  if (updateFields.length === 0) {
    const result = await db.select<DbBucketListCategory[]>(
      `SELECT ${DB_COLUMNS.BUCKET_LIST_CATEGORIES.join(', ')} FROM bucket_list_categories
       WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Bucket list category not found')
    }
    return mapDbBucketListCategoryToBucketListCategory(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE bucket_list_categories SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbBucketListCategory[]>(
      `SELECT ${DB_COLUMNS.BUCKET_LIST_CATEGORIES.join(', ')} FROM bucket_list_categories
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error('Failed to update bucket list category: record not found after update')
    }

    return mapDbBucketListCategoryToBucketListCategory(result[0])
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const categoryName = input.name || ''
      throw new Error(`「${categoryName}」という名前のカテゴリーは既に存在します`)
    }

    handleDbError(err, 'update bucket list category')
  }
}

export async function deleteBucketListCategory(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM bucket_list_categories WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Bucket list category not found')
    }
  } catch (err) {
    handleDbError(err, 'delete bucket list category')
  }
}
