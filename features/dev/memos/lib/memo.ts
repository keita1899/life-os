import { getDatabase, handleDbError } from '@/lib/db'
import type {
  DevMemo,
  CreateDevMemoInput,
  UpdateDevMemoInput,
} from '../types/dev-memo'

interface DbDevMemo {
  id: number
  content: string
  project_id: number | null
  tags: string
  created_at: string
  updated_at: string
}

function parseTags(tagsJson: string): string[] {
  try {
    const parsed = JSON.parse(tagsJson) as unknown
    return Array.isArray(parsed)
      ? (parsed as string[]).filter((t): t is string => typeof t === 'string')
      : []
  } catch {
    return []
  }
}

function mapDbMemoToMemo(dbMemo: DbDevMemo): DevMemo {
  return {
    id: dbMemo.id,
    content: dbMemo.content,
    projectId: dbMemo.project_id,
    tags: parseTags(dbMemo.tags),
    createdAt: dbMemo.created_at,
    updatedAt: dbMemo.updated_at,
  }
}

export type DevMemosOrderBy = 'newest' | 'oldest'

export interface GetDevMemosOptions {
  projectId?: number | null
  keyword?: string
  orderBy?: DevMemosOrderBy
}

const ORDER_CLAUSE = {
  newest: 'ORDER BY updated_at DESC',
  oldest: 'ORDER BY updated_at ASC',
} as const

export async function getDevMemos(
  options?: GetDevMemosOptions,
): Promise<DevMemo[]> {
  const db = await getDatabase()
  const rawKeyword = options?.keyword?.trim()
  const hasKeyword = Boolean(rawKeyword)
  const projectId = options?.projectId
  const orderClause = ORDER_CLAUSE[options?.orderBy ?? 'newest']

  const keywordPattern = hasKeyword
    ? `%${String(rawKeyword).replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')}%`
    : ''

  try {
    if (projectId != null && hasKeyword) {
      const result = await db.select<DbDevMemo[]>(
        `SELECT id, content, project_id, tags, created_at, updated_at
         FROM dev_memos
         WHERE project_id = ? AND content LIKE ? ESCAPE '\\'
         ${orderClause}`,
        [projectId, keywordPattern],
      )
      return result.map(mapDbMemoToMemo)
    }
    if (projectId != null) {
      const result = await db.select<DbDevMemo[]>(
        `SELECT id, content, project_id, tags, created_at, updated_at
         FROM dev_memos
         WHERE project_id = ?
         ${orderClause}`,
        [projectId],
      )
      return result.map(mapDbMemoToMemo)
    }
    if (hasKeyword) {
      const result = await db.select<DbDevMemo[]>(
        `SELECT id, content, project_id, tags, created_at, updated_at
         FROM dev_memos
         WHERE content LIKE ? ESCAPE '\\'
         ${orderClause}`,
        [keywordPattern],
      )
      return result.map(mapDbMemoToMemo)
    }

    const result = await db.select<DbDevMemo[]>(
      `SELECT id, content, project_id, tags, created_at, updated_at
       FROM dev_memos
       ${orderClause}`,
    )
    return result.map(mapDbMemoToMemo)
  } catch (err) {
    handleDbError(err, 'get dev memos')
  }
}

export async function getDevMemosByProjectId(
  projectId: number,
): Promise<DevMemo[]> {
  return getDevMemos({ projectId })
}

export async function getDevMemoById(id: number): Promise<DevMemo | null> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbDevMemo[]>(
      `SELECT id, content, project_id, tags, created_at, updated_at
       FROM dev_memos
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      return null
    }

    return mapDbMemoToMemo(result[0])
  } catch (err) {
    handleDbError(err, 'get dev memo by id')
  }
}

export async function createDevMemo(
  input: CreateDevMemoInput,
): Promise<DevMemo> {
  const db = await getDatabase()
  const tagsJson = JSON.stringify(input.tags ?? [])

  try {
    const insertResult = await db.execute(
      `INSERT INTO dev_memos (content, project_id, tags)
       VALUES (?, ?, ?)`,
      [input.content, input.projectId ?? null, tagsJson],
    )

    const lastId =
      typeof insertResult?.lastInsertId === 'number'
        ? insertResult.lastInsertId
        : undefined
    if (lastId === undefined) {
      const fallback = await db.select<DbDevMemo[]>(
        `SELECT id, content, project_id, tags, created_at, updated_at
         FROM dev_memos
         ORDER BY id DESC
         LIMIT 1`,
      )
      if (fallback.length === 0) {
        throw new Error(
          'Failed to create dev memo: record not found after insert',
        )
      }
      return mapDbMemoToMemo(fallback[0])
    }

    const result = await db.select<DbDevMemo[]>(
      `SELECT id, content, project_id, tags, created_at, updated_at
       FROM dev_memos
       WHERE id = ?`,
      [lastId],
    )
    if (result.length === 0) {
      throw new Error(
        'Failed to create dev memo: record not found after insert',
      )
    }
    return mapDbMemoToMemo(result[0])
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith('Failed to create dev memo')
    ) {
      throw err
    }
    handleDbError(err, 'create dev memo')
  }
}

export async function updateDevMemo(
  id: number,
  input: UpdateDevMemoInput,
): Promise<DevMemo> {
  const db = await getDatabase()
  const current = await getDevMemoById(id)
  if (!current) {
    throw new Error('Memo not found')
  }

  const updates: string[] = []
  const values: unknown[] = []

  if (input.content !== undefined) {
    updates.push('content = ?')
    values.push(input.content)
  }

  if (input.projectId !== undefined) {
    updates.push('project_id = ?')
    values.push(input.projectId ?? null)
  }

  if (input.tags !== undefined) {
    updates.push('tags = ?')
    values.push(JSON.stringify(input.tags))
  }

  if (updates.length === 0) {
    return current
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  try {
    await db.execute(
      `UPDATE dev_memos SET ${updates.join(', ')} WHERE id = ?`,
      values,
    )

    const updated = await getDevMemoById(id)
    if (!updated) {
      throw new Error('Failed to update dev memo: record not found')
    }
    return updated
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith('Failed to update dev memo')
    ) {
      throw err
    }
    handleDbError(err, 'update dev memo')
  }
}

export async function deleteDevMemo(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute('DELETE FROM dev_memos WHERE id = ?', [id])

    if (result.rowsAffected === 0) {
      throw new Error('Memo not found')
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'Memo not found') {
      throw err
    }
    handleDbError(err, 'delete dev memo')
  }
}
