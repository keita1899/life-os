import {
  createDailyLogApi,
  LIFE_DAILY_LOG_CONFIG,
} from './core/daily-log-api'
import type {
  DailyLog,
  CreateDailyLogInput,
  UpdateDailyLogInput,
} from '../types/daily-log'

const api = createDailyLogApi(LIFE_DAILY_LOG_CONFIG)

function toDailyLog(shape: {
  id: number
  logDate: string
  content: string | null
  createdAt: string
  updatedAt: string
}): DailyLog {
  const { content, ...rest } = shape
  return { ...rest, diary: content }
}

export async function getDailyLogByDate(logDate: string): Promise<DailyLog | null> {
  const result = await api.getByDate(logDate)
  return result ? toDailyLog(result as never) : null
}

export async function createDailyLog(
  input: CreateDailyLogInput,
): Promise<DailyLog> {
  const result = await api.create({
    logDate: input.logDate,
    content: input.diary,
  })
  return toDailyLog(result as never)
}

export async function updateDailyLog(
  logDate: string,
  input: UpdateDailyLogInput,
): Promise<DailyLog> {
  const result = await api.update(logDate, { content: input.diary })
  return toDailyLog(result as never)
}

export async function deleteDailyLog(logDate: string): Promise<void> {
  return api.delete(logDate)
}
