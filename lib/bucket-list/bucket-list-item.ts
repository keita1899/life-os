import { getDatabase, handleDbError } from '../db'
import { DB_COLUMNS } from '../db/constants'
import type {
  BucketListItem,
  CreateBucketListItemInput,
  UpdateBucketListItemInput,
} from '../types/bucket-list-item'
import type { BucketListCategory } from '../types/bucket-list-category'

interface DbBucketListItem {
  id: number
  title: string
  category_id: number | null
  target_year: number | null
  achieved_date: string | null
  completed: number
  order: number
  created_at: string
  updated_at: string
}

interface DbBucketListItemWithCategory extends DbBucketListItem {
  category_id_from_join: number | null
  category_name: string | null
  category_created_at: string | null
  category_updated_at: string | null
}

function mapDbBucketListItemToBucketListItem(
  dbItem: DbBucketListItemWithCategory,
): BucketListItem {
  const category: BucketListCategory | null =
    dbItem.category_id_from_join && dbItem.category_name
      ? {
          id: dbItem.category_id_from_join,
          name: dbItem.category_name,
          createdAt: dbItem.category_created_at!,
          updatedAt: dbItem.category_updated_at!,
        }
      : null

  return {
    id: dbItem.id,
    title: dbItem.title,
    categoryId: dbItem.category_id,
    category,
    targetYear: dbItem.target_year,
    achievedDate: dbItem.achieved_date,
    completed: dbItem.completed === 1,
    order: dbItem.order,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at,
  }
}

async function getMaxOrder(): Promise<number> {
  const db = await getDatabase()
  const result = await db.select<{ max_order: number | null }[]>(
    'SELECT MAX("order") as max_order FROM bucket_list_items',
  )
  return result[0]?.max_order ?? -1
}

export async function getAllBucketListItems(): Promise<BucketListItem[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbBucketListItemWithCategory[]>(
      `SELECT 
        wi.id,
        wi.title,
        wi.category_id,
        wi.target_year,
        wi.achieved_date,
        wi.completed,
        wi."order",
        wi.created_at,
        wi.updated_at,
        wc.id as category_id_from_join,
        wc.name as category_name,
        wc.created_at as category_created_at,
        wc.updated_at as category_updated_at
      FROM bucket_list_items wi
      LEFT JOIN bucket_list_categories wc ON wi.category_id = wc.id
      ORDER BY wi."order" ASC, wi.created_at ASC`,
    )

    return result.map(mapDbBucketListItemToBucketListItem)
  } catch (err) {
    handleDbError(err, 'get bucket list items')
  }
}

export async function createBucketListItem(
  input: CreateBucketListItemInput,
): Promise<BucketListItem> {
  const db = await getDatabase()

  const maxOrder = await getMaxOrder()
  const newOrder = maxOrder + 1

  try {
    await db.execute(
      `INSERT INTO bucket_list_items (title, category_id, target_year, "order")
       VALUES (?, ?, ?, ?)`,
      [
        input.title,
        input.categoryId || null,
        input.targetYear || null,
        newOrder,
      ],
    )

    const result = await db.select<DbBucketListItemWithCategory[]>(
      `SELECT 
        wi.id,
        wi.title,
        wi.category_id,
        wi.target_year,
        wi.achieved_date,
        wi.completed,
        wi."order",
        wi.created_at,
        wi.updated_at,
        wc.id as category_id_from_join,
        wc.name as category_name,
        wc.created_at as category_created_at,
        wc.updated_at as category_updated_at
      FROM bucket_list_items wi
      LEFT JOIN bucket_list_categories wc ON wi.category_id = wc.id
      WHERE wi.title = ? AND wi."order" = ?
      ORDER BY wi.created_at DESC, wi.id DESC
      LIMIT 1`,
      [input.title, newOrder],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to create bucket list item: record not found after insert',
      )
    }

    return mapDbBucketListItemToBucketListItem(result[0])
  } catch (err) {
    handleDbError(err, 'create bucket list item')
  }
}

export async function updateBucketListItem(
  id: number,
  input: UpdateBucketListItemInput,
): Promise<BucketListItem> {
  const db = await getDatabase()

  const updateFields: string[] = []
  const updateValues: unknown[] = []

  if (input.title !== undefined) {
    updateFields.push('title = ?')
    updateValues.push(input.title)
  }

  if (input.categoryId !== undefined) {
    updateFields.push('category_id = ?')
    updateValues.push(input.categoryId || null)
  }

  if (input.targetYear !== undefined) {
    updateFields.push('target_year = ?')
    updateValues.push(input.targetYear || null)
  }

  if (input.achievedDate !== undefined) {
    updateFields.push('achieved_date = ?')
    updateValues.push(input.achievedDate || null)
  }

  if (input.completed !== undefined) {
    updateFields.push('completed = ?')
    updateValues.push(input.completed ? 1 : 0)
    if (input.completed) {
      if (input.achievedDate === undefined) {
        const today = new Date().toISOString().split('T')[0]
        updateFields.push('achieved_date = ?')
        updateValues.push(today)
      }
    } else {
      if (input.achievedDate === undefined) {
        updateFields.push('achieved_date = ?')
        updateValues.push(null)
      }
    }
  }

  if (input.order !== undefined) {
    updateFields.push('"order" = ?')
    updateValues.push(input.order)
  }

  if (updateFields.length === 0) {
    const result = await db.select<DbBucketListItemWithCategory[]>(
      `SELECT 
        wi.id,
        wi.title,
        wi.category_id,
        wi.target_year,
        wi.achieved_date,
        wi.completed,
        wi."order",
        wi.created_at,
        wi.updated_at,
        wc.id as category_id_from_join,
        wc.name as category_name,
        wc.created_at as category_created_at,
        wc.updated_at as category_updated_at
      FROM bucket_list_items wi
      LEFT JOIN bucket_list_categories wc ON wi.category_id = wc.id
      WHERE wi.id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Bucket list item not found')
    }
    return mapDbBucketListItemToBucketListItem(result[0])
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  updateValues.push(id)

  try {
    await db.execute(
      `UPDATE bucket_list_items SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    )

    const result = await db.select<DbBucketListItemWithCategory[]>(
      `SELECT 
        wi.id,
        wi.title,
        wi.category_id,
        wi.target_year,
        wi.achieved_date,
        wi.completed,
        wi."order",
        wi.created_at,
        wi.updated_at,
        wc.id as category_id_from_join,
        wc.name as category_name,
        wc.created_at as category_created_at,
        wc.updated_at as category_updated_at
      FROM bucket_list_items wi
      LEFT JOIN bucket_list_categories wc ON wi.category_id = wc.id
      WHERE wi.id = ?`,
      [id],
    )

    if (result.length === 0) {
      throw new Error(
        'Failed to update bucket list item: record not found after update',
      )
    }

    return mapDbBucketListItemToBucketListItem(result[0])
  } catch (err) {
    handleDbError(err, 'update bucket list item')
  }
}

export async function deleteBucketListItem(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM bucket_list_items WHERE id = ?',
      [id],
    )

    if (result.rowsAffected === 0) {
      throw new Error('Bucket list item not found')
    }
  } catch (err) {
    handleDbError(err, 'delete bucket list item')
  }
}

export async function deleteCompletedBucketListItems(): Promise<number> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM bucket_list_items WHERE completed = 1',
    )
    return result.rowsAffected
  } catch (err) {
    handleDbError(err, 'delete completed bucket list items')
  }
}

export async function updateBucketListItemOrder(
  id: number,
  order: number,
): Promise<void> {
  const db = await getDatabase()

  try {
    await db.execute('UPDATE bucket_list_items SET "order" = ? WHERE id = ?', [
      order,
      id,
    ])
  } catch (err) {
    handleDbError(err, 'update bucket list item order')
  }
}
