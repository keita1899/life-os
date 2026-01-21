import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getDailyLogByDate,
  createDailyLog,
  updateDailyLog,
} from '@/lib/logs'
import type {
  DailyLog,
  CreateDailyLogInput,
  UpdateDailyLogInput,
} from '@/lib/types/daily-log'
import { fetcher } from '@/lib/swr'

export function useDailyLog(logDate: string) {
  const dailyLogKey = ['daily-log', logDate]

  const {
    data,
    error,
    isLoading,
  } = useSWR<DailyLog | null>(dailyLogKey, () =>
    fetcher(() => getDailyLogByDate(logDate)),
  )

  const handleCreateDailyLog = async (input: CreateDailyLogInput) => {
    await createDailyLog(input)
    await mutate(dailyLogKey)
  }

  const handleUpdateDailyLog = async (input: UpdateDailyLogInput) => {
    await updateDailyLog(logDate, input)
    await mutate(dailyLogKey)
  }

  return {
    dailyLog: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch daily log'
      : null,
    createDailyLog: handleCreateDailyLog,
    updateDailyLog: handleUpdateDailyLog,
    refreshDailyLog: () => mutate(dailyLogKey),
  }
}
