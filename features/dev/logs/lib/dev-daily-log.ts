import {
  createDailyLogApi,
  DEV_DAILY_LOG_CONFIG,
} from '@/features/logs/lib/core/daily-log-api'
import type {
  DevDailyLog,
  CreateDevDailyLogInput,
  UpdateDevDailyLogInput,
} from '../types/dev-daily-log'

const api = createDailyLogApi(DEV_DAILY_LOG_CONFIG)

function toDevDailyLog(shape: {
  id: number
  logDate: string
  content: string | null
  createdAt: string
  updatedAt: string
}): DevDailyLog {
  const { content, ...rest } = shape
  return { ...rest, report: content }
}

export async function getDevDailyLogByDate(
  logDate: string,
): Promise<DevDailyLog | null> {
  const result = await api.getByDate(logDate)
  return result ? toDevDailyLog(result as never) : null
}

export async function createDevDailyLog(
  input: CreateDevDailyLogInput,
): Promise<DevDailyLog> {
  const result = await api.create({
    logDate: input.logDate,
    content: input.report,
  })
  return toDevDailyLog(result as never)
}

export async function updateDevDailyLog(
  logDate: string,
  input: UpdateDevDailyLogInput,
): Promise<DevDailyLog> {
  const result = await api.update(logDate, { content: input.report })
  return toDevDailyLog(result as never)
}

export async function deleteDevDailyLog(logDate: string): Promise<void> {
  return api.delete(logDate)
}
