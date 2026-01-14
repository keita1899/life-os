import useSWR from 'swr'
import { mutate } from 'swr'
import { createTask, getAllTasks, updateTask, deleteTask } from '@/lib/tasks'
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
    await createTask(input)
    await mutate(tasksKey)
  }

  const handleUpdateTask = async (id: number, input: UpdateTaskInput) => {
    await updateTask(id, input)
    await mutate(tasksKey)
  }

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id)
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
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    refreshTasks: () => mutate(tasksKey),
  }
}
