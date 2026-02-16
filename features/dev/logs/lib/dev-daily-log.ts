import {
  createDailyLogApi,
  DEV_DAILY_LOG_CONFIG,
  type DailyLogShape,
} from '@/features/logs/lib/core/daily-log-api'
import type {
  DevDailyLog,
  CreateDevDailyLogInput,
  UpdateDevDailyLogInput,
} from '../types/dev-daily-log'

const api = createDailyLogApi(DEV_DAILY_LOG_CONFIG)

function toDevDailyLog(shape: DailyLogShape): DevDailyLog {
  const { content, ...rest } = shape
  return { ...rest, report: content }
}

export async function getDevDailyLogByDate(
  logDate: string,
): Promise<DevDailyLog | null> {
  const result = await api.getByDate(logDate)
  return result ? toDevDailyLog(result) : null
}

export async function createDevDailyLog(
  input: CreateDevDailyLogInput,
): Promise<DevDailyLog> {
  const result = await api.create({
    logDate: input.logDate,
    content: input.report,
  })
  return toDevDailyLog(result)
}

export async function updateDevDailyLog(
  logDate: string,
  input: UpdateDevDailyLogInput,
): Promise<DevDailyLog> {
  const result = await api.update(logDate, { content: input.report })
  return toDevDailyLog(result)
}

export async function deleteDevDailyLog(logDate: string): Promise<void> {
  return api.delete(logDate)
}
