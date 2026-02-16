import {
  createDailyLogApi,
  LIFE_DAILY_LOG_CONFIG,
  type DailyLogShape,
} from './core/daily-log-api'
import type {
  DailyLog,
  CreateDailyLogInput,
  UpdateDailyLogInput,
} from '../types/daily-log'

const api = createDailyLogApi(LIFE_DAILY_LOG_CONFIG)

function toDailyLog(shape: DailyLogShape): DailyLog {
  const { content, ...rest } = shape
  return { ...rest, diary: content }
}

export async function getDailyLogByDate(logDate: string): Promise<DailyLog | null> {
  const result = await api.getByDate(logDate)
  return result ? toDailyLog(result) : null
}

export async function createDailyLog(
  input: CreateDailyLogInput,
): Promise<DailyLog> {
  const result = await api.create({
    logDate: input.logDate,
    content: input.diary,
  })
  return toDailyLog(result)
}

export async function updateDailyLog(
  logDate: string,
  input: UpdateDailyLogInput,
): Promise<DailyLog> {
  const result = await api.update(logDate, { content: input.diary })
  return toDailyLog(result)
}

export async function deleteDailyLog(logDate: string): Promise<void> {
  return api.delete(logDate)
}
