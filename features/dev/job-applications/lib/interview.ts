import { getDatabase, handleDbError } from '@/lib/db'
import type {
  JobInterview,
  CreateJobInterviewInput,
  UpdateJobInterviewInput,
  InterviewType,
  InterviewResult,
} from '../types/job-interview'

interface DbJobInterview {
  id: number
  application_id: number
  round: number
  interview_type: string
  scheduled_date: string | null
  scheduled_time: string | null
  location: string | null
  notes: string | null
  result: string | null
  created_at: string
  updated_at: string
}

function mapDbToInterview(row: DbJobInterview): JobInterview {
  return {
    id: row.id,
    applicationId: row.application_id,
    round: row.round,
    interviewType: row.interview_type as InterviewType,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    location: row.location,
    notes: row.notes,
    result: (row.result as InterviewResult) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getInterviewsByApplicationId(
  applicationId: number,
): Promise<JobInterview[]> {
  const db = await getDatabase()

  try {
    const result = await db.select<DbJobInterview[]>(
      `SELECT id, application_id, round, interview_type,
              scheduled_date, scheduled_time, location, notes, result,
              created_at, updated_at
       FROM job_interviews
       WHERE application_id = ?
       ORDER BY round ASC`,
      [applicationId],
    )
    return result.map(mapDbToInterview)
  } catch (err) {
    handleDbError(err, 'get interviews by application id')
  }
}

export async function createJobInterview(
  input: CreateJobInterviewInput,
): Promise<JobInterview> {
  const db = await getDatabase()

  try {
    const insertResult = await db.execute(
      `INSERT INTO job_interviews (application_id, round, interview_type, scheduled_date, scheduled_time, location, notes, result)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.applicationId,
        input.round ?? 1,
        input.interviewType ?? 'interview',
        input.scheduledDate ?? null,
        input.scheduledTime ?? null,
        input.location ?? null,
        input.notes ?? null,
        input.result ?? null,
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
      throw new Error('Failed to create interview: could not retrieve inserted id')
    }

    const result = await db.select<DbJobInterview[]>(
      `SELECT id, application_id, round, interview_type,
              scheduled_date, scheduled_time, location, notes, result,
              created_at, updated_at
       FROM job_interviews WHERE id = ?`,
      [insertedId],
    )

    if (result.length === 0) {
      throw new Error('Failed to create interview: record not found after insert')
    }

    return mapDbToInterview(result[0])
  } catch (err) {
    handleDbError(err, 'create job interview')
  }
}

export async function updateJobInterview(
  id: number,
  input: UpdateJobInterviewInput,
): Promise<JobInterview> {
  const db = await getDatabase()

  const updates: string[] = []
  const values: unknown[] = []

  if (input.round !== undefined) {
    updates.push('round = ?')
    values.push(input.round)
  }
  if (input.interviewType !== undefined) {
    updates.push('interview_type = ?')
    values.push(input.interviewType)
  }
  if (input.scheduledDate !== undefined) {
    updates.push('scheduled_date = ?')
    values.push(input.scheduledDate ?? null)
  }
  if (input.scheduledTime !== undefined) {
    updates.push('scheduled_time = ?')
    values.push(input.scheduledTime ?? null)
  }
  if (input.location !== undefined) {
    updates.push('location = ?')
    values.push(input.location ?? null)
  }
  if (input.notes !== undefined) {
    updates.push('notes = ?')
    values.push(input.notes ?? null)
  }
  if (input.result !== undefined) {
    updates.push('result = ?')
    values.push(input.result ?? null)
  }

  if (updates.length === 0) {
    const rows = await db.select<DbJobInterview[]>(
      `SELECT id, application_id, round, interview_type,
              scheduled_date, scheduled_time, location, notes, result,
              created_at, updated_at
       FROM job_interviews WHERE id = ?`,
      [id],
    )
    if (rows.length === 0) throw new Error('Interview not found')
    return mapDbToInterview(rows[0])
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  try {
    await db.execute(
      `UPDATE job_interviews SET ${updates.join(', ')} WHERE id = ?`,
      values,
    )

    const result = await db.select<DbJobInterview[]>(
      `SELECT id, application_id, round, interview_type,
              scheduled_date, scheduled_time, location, notes, result,
              created_at, updated_at
       FROM job_interviews WHERE id = ?`,
      [id],
    )
    if (result.length === 0) {
      throw new Error('Failed to update interview: record not found')
    }
    return mapDbToInterview(result[0])
  } catch (err) {
    handleDbError(err, 'update job interview')
  }
}

export async function deleteJobInterview(id: number): Promise<void> {
  const db = await getDatabase()

  try {
    const result = await db.execute(
      'DELETE FROM job_interviews WHERE id = ?',
      [id],
    )
    if (result.rowsAffected === 0) {
      throw new Error('Interview not found')
    }
  } catch (err) {
    handleDbError(err, 'delete job interview')
  }
}
