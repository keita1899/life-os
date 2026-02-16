import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getDailyLogByDate,
  createDailyLog,
  updateDailyLog,
} from '../lib'
import type {
  DailyLog,
  CreateDailyLogInput,
  UpdateDailyLogInput,
} from '../types/daily-log'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useDailyLog(logDate: string) {
  const key = SWR_KEYS.dailyLog(logDate)

  const {
    data,
    error,
    isLoading,
  } = useSWR<DailyLog | null>(key, () =>
    fetcher(() => getDailyLogByDate(logDate)),
  )

  const handleCreateDailyLog = async (input: CreateDailyLogInput) => {
    await createDailyLog(input)
    await mutate(key)
  }

  const handleUpdateDailyLog = async (input: UpdateDailyLogInput) => {
    await updateDailyLog(logDate, input)
    await mutate(key)
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
    refreshDailyLog: () => mutate(key),
  }
}
