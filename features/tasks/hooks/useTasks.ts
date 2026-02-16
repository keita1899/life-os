import useSWR, { useSWRConfig } from 'swr'
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  deleteCompletedTasks,
  updateOverdueTasksToToday,
} from '../lib'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useTasks() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Task[]>(SWR_KEYS.tasks, () => fetcher(() => getAllTasks()))
  const { mutate } = useSWRConfig()

  const handleCreateTask = async (input: CreateTaskInput) => {
    const result = await createTask(input)
    await mutate(
      SWR_KEYS.tasks,
      (current: Task[] | undefined) => [...(current ?? []), result],
      { revalidate: false },
    )
    return result
  }

  const handleUpdateTask = async (id: number, input: UpdateTaskInput) => {
    const result = await updateTask(id, input)
    await mutate(
      SWR_KEYS.tasks,
      (current: Task[] | undefined) =>
        (current ?? []).map((t) => (t.id === id ? result : t)),
      { revalidate: false },
    )
    return result
  }

  const handleDeleteTask = async (id: number) => {
    await mutate(
      SWR_KEYS.tasks,
      async (current: Task[] | undefined) => {
        await deleteTask(id)
        return (current ?? []).filter((t) => t.id !== id)
      },
      {
        optimisticData: (current: Task[] | undefined) =>
          (current ?? []).filter((t) => t.id !== id),
        revalidate: false,
        rollbackOnError: true,
      },
    )
    return true
  }

  const handleToggleTaskCompletion = async (id: number, completed: boolean) => {
    await mutate(
      SWR_KEYS.tasks,
      async (current: Task[] | undefined) => {
        await updateTask(id, { completed })
        return (current ?? []).map((t) =>
          t.id === id ? { ...t, completed } : t,
        )
      },
      {
        optimisticData: (current: Task[] | undefined) =>
          (current ?? []).map((t) =>
            t.id === id ? { ...t, completed } : t,
          ),
        revalidate: false,
        rollbackOnError: true,
      },
    )
  }

  const handleDeleteCompletedTasks = async () => {
    const completedIds = data.filter((t) => t.completed).map((t) => t.id)
    const count = await deleteCompletedTasks()
    await mutate(
      SWR_KEYS.tasks,
      (current: Task[] | undefined) =>
        (current ?? []).filter((t) => !completedIds.includes(t.id)),
      { revalidate: false },
    )
    return count
  }

  const handleUpdateOverdueTasksToToday = async (): Promise<number> => {
    const count = await updateOverdueTasksToToday()
    await mutate(SWR_KEYS.tasks)
    return count
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
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    toggleTaskCompletion: handleToggleTaskCompletion,
    deleteCompletedTasks: handleDeleteCompletedTasks,
    updateOverdueTasksToToday: handleUpdateOverdueTasksToToday,
  }
}
