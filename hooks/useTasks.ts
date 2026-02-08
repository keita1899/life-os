import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  deleteCompletedTasks,
  updateOverdueTasksToToday,
} from '@/lib/tasks'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/lib/types/task'
import { fetcher } from '@/lib/swr'

const tasksKey = 'tasks'

export function useTasks() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Task[]>(tasksKey, () => fetcher(() => getAllTasks()))

  const handleCreateTask = async (input: CreateTaskInput) => {
    const result = await createTask(input)
    await mutate(tasksKey)
    return result
  }

  const handleUpdateTask = async (id: number, input: UpdateTaskInput) => {
    const result = await updateTask(id, input)
    await mutate(tasksKey)
    return result
  }

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id)
    await mutate(tasksKey)
    return true
  }

  const handleToggleTaskCompletion = async (id: number, completed: boolean) => {
    await updateTask(id, { completed })
    await mutate(tasksKey)
  }

  const handleDeleteCompletedTasks = async () => {
    const count = await deleteCompletedTasks()
    await mutate(tasksKey)
    return count
  }

  const handleUpdateOverdueTasksToToday = async (): Promise<number> => {
    const count = await updateOverdueTasksToToday()
    await mutate(tasksKey)
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
