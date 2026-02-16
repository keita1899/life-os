import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getDevDailyLogByDate,
  createDevDailyLog,
  updateDevDailyLog,
} from '../lib'
import type {
  DevDailyLog,
  CreateDevDailyLogInput,
  UpdateDevDailyLogInput,
} from '../types/dev-daily-log'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useDevDailyLog(logDate: string) {
  const key = SWR_KEYS.devDailyLog(logDate)

  const {
    data,
    error,
    isLoading,
  } = useSWR<DevDailyLog | null>(key, () =>
    fetcher(() => getDevDailyLogByDate(logDate)),
  )

  const handleCreateDevDailyLog = async (input: CreateDevDailyLogInput) => {
    await createDevDailyLog(input)
    await mutate(key)
  }

  const handleUpdateDevDailyLog = async (input: UpdateDevDailyLogInput) => {
    await updateDevDailyLog(logDate, input)
    await mutate(key)
  }

  return {
    devDailyLog: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch dev daily log'
      : null,
    createDevDailyLog: handleCreateDevDailyLog,
    updateDevDailyLog: handleUpdateDevDailyLog,
    refreshDevDailyLog: () => mutate(key),
  }
}
