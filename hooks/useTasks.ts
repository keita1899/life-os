import useSWR from 'swr'
import { mutate } from 'swr'
import { createTask, getAllTasks } from '@/lib/tasks'
import type { Task, CreateTaskInput } from '@/lib/types/task'
import { fetcher } from '@/lib/swr'

const tasksKey = 'tasks'

export function useTasks() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Task[]>(tasksKey, () => fetcher(() => getAllTasks()))

  const handleCreateTask = async (input: CreateTaskInput) => {
    await createTask(input)
    await mutate(tasksKey)
  }

  return {
    tasks: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch tasks'
      : null,
    createTask: handleCreateTask,
    refreshTasks: () => mutate(tasksKey),
  }
}
