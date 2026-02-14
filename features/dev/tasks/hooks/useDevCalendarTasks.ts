import useSWR from 'swr'
import { getAllDevTasks } from '../lib'
import type { DevTask } from '../types/dev-task'
import { fetcher } from '@/lib/swr'

const devCalendarTasksKey = 'dev-calendar-tasks'

export function useDevCalendarTasks() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<DevTask[]>(devCalendarTasksKey, () =>
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

