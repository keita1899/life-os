import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getDevDailyLogByDate,
  createDevDailyLog,
  updateDevDailyLog,
} from '@/lib/dev/logs'
import type {
  DevDailyLog,
  CreateDevDailyLogInput,
  UpdateDevDailyLogInput,
} from '@/lib/types/dev-daily-log'
import { fetcher } from '@/lib/swr'

export function useDevDailyLog(logDate: string) {
  const devDailyLogKey = ['dev-daily-log', logDate]

  const {
    data,
    error,
    isLoading,
  } = useSWR<DevDailyLog | null>(devDailyLogKey, () =>
    fetcher(() => getDevDailyLogByDate(logDate)),
  )

  const handleCreateDevDailyLog = async (input: CreateDevDailyLogInput) => {
    await createDevDailyLog(input)
    await mutate(devDailyLogKey)
  }

  const handleUpdateDevDailyLog = async (input: UpdateDevDailyLogInput) => {
    await updateDevDailyLog(logDate, input)
    await mutate(devDailyLogKey)
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
    refreshDevDailyLog: () => mutate(devDailyLogKey),
  }
}
