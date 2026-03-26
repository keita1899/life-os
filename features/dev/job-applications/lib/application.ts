import { getDatabase, handleDbError } from '@/lib/db'
import type {
  JobApplication,
  CreateJobApplicationInput,
  UpdateJobApplicationInput,
  ApplicationStatus,
} from '../types/job-application'

interface DbJobApplication {
  id: number
  company_name: string
  status: string
  url: string | null
  applied_date: string | null
  notes: string | null
  order: number
  created_at: string
  updated_at: string
}

function mapDbToApplication(row: DbJobApplication): JobApplication {
  return {
    id: row.id,
    companyName: row.company_name,
    status: row.status as ApplicationStatus,
    url: row.url,
    appliedDate: row.applied_date,
    notes: row.notes,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAllJobApplications(): Promise<JobApplication[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbJobApplication[]>(
      `SELECT id, company_name, status, url,
              applied_date, notes, "order",
              created_at, updated_at
       FROM job_applications
       ORDER BY "order" ASC, created_at DESC`,
    )
    return result.map(mapDbToApplication)
  } catch (err) {
    handleDbError(err, 'get job applications')
  }
}

export async function getJobApplicationById(
  id: number,
): Promise<JobApplication | null> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbJobApplication[]>(
      `SELECT id, company_name, status, url,
              applied_date, notes, "order",
              created_at, updated_at
       FROM job_applications
       WHERE id = ?`,
      [id],
    )

    if (result.length === 0) return null
    return mapDbToApplication(result[0])
  } catch (err) {
    handleDbError(err, 'get job application by id')
  }
}

export async function createJobApplication(
  input: CreateJobApplicationInput,
): Promise<JobApplication> {
  const db = await getDatabase()

  try {
    const insertResult = await db.execute(
      `INSERT INTO job_applications (company_name, status, url, applied_date, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.companyName,
        input.status ?? 'interested',
        input.url ?? null,
        input.appliedDate ?? null,
        input.notes ?? null,
      ],
    )

    let insertedId: number | undefined
    if (
      insertResult != null &&
      typeof insertResult === 'object' &&
      'lastInsertId' in insertResult
    ) {
      insertedId = (insertResult as { lastInsertId: number }).lastInsertId
    }
    if (insertedId == null) {
      const fallback = await db.select<{ last_insert_rowid: number }[]>(
        'SELECT last_insert_rowid() as last_insert_rowid',
      )
      insertedId = fallback[0]?.last_insert_rowid
    }
    if (insertedId == null) {
      throw new Error('Failed to create job application: could not retrieve inserted id')
    }

    const result = await db.select<DbJobApplication[]>(
      `SELECT id, company_name, status, url,
              applied_date, notes, "order",
              created_at, updated_at
       FROM job_applications WHERE id = ?`,
      [insertedId],
    )

    if (result.length === 0) {
      throw new Error('Failed to create job application: record not found after insert')
    }

    return mapDbToApplication(result[0])
  } catch (err) {
    handleDbError(err, 'create job application')
  }
}

export async function updateJobApplication(
  id: number,
  input: UpdateJobApplicationInput,
): Promise<JobApplication> {
  const db = await getDatabase()

  const updates: string[] = []
  const values: unknown[] = []

  if (input.companyName !== undefined) {
    updates.push('company_name = ?')
    values.push(input.companyName)
  }
  if (input.status !== undefined) {
    updates.push('status = ?')
    values.push(input.status)
  }
  if (input.url !== undefined) {
    updates.push('url = ?')
    values.push(input.url ?? null)
  }
  if (input.appliedDate !== undefined) {
    updates.push('applied_date = ?')
    values.push(input.appliedDate ?? null)
  }
  if (input.notes !== undefined) {
    updates.push('notes = ?')
    values.push(input.notes ?? null)
  }

  if (updates.length === 0) {
    const current = await getJobApplicationById(id)
    if (!current) throw new Error('Application not found')
    return current
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  try {
    await db.execute(
      `UPDATE job_applications SET ${updates.join(', ')} WHERE id = ?`,
      values,
    )

    const updated = await getJobApplicationById(id)
    if (!updated) throw new Error('Failed to update job application: record not found')
    return updated
  } catch (err) {
    handleDbError(err, 'update job application')
  }
}

export async function deleteJobApplication(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM job_applications WHERE id = ?',
      [id],
    )
    if (result.rowsAffected === 0) {
      throw new Error('Application not found')
    }
  } catch (err) {
    handleDbError(err, 'delete job application')
  }
}
