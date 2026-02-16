import useSWR from 'swr'
import { getAllDevTasks } from '../lib'
import type { DevTask } from '../types/dev-task'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useDevCalendarTasks() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<DevTask[]>(SWR_KEYS.devTasks, () =>
    fetcher(() => getAllDevTasks()),
  )

  return {
    tasks: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch dev calendar tasks'
      : null,
  }
}

