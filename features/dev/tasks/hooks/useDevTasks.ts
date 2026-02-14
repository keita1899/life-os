import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createDevTask,
  getDevTasks,
  updateDevTask,
  deleteDevTask,
  deleteCompletedDevTasks,
  updateOverdueDevTasksToToday,
} from '../lib'
import type {
  DevTask,
  CreateDevTaskInput,
  UpdateDevTaskInput,
} from '../types/dev-task'
import { fetcher } from '@/lib/swr'

type DevTaskProjectFilter = number | null
type DevTaskTypeFilter = DevTask['type']
const devCalendarTasksKey = 'dev-calendar-tasks'

interface UseDevTasksResult {
  tasks: DevTask[]
  isLoading: boolean
  error: string | null
  createTask: (input: CreateDevTaskInput) => Promise<DevTask>
  updateTask: (id: number, input: UpdateDevTaskInput) => Promise<DevTask>
  deleteTask: (id: number) => Promise<boolean>
  toggleTaskCompletion: (id: number, completed: boolean) => Promise<void>
  deleteCompletedTasks: () => Promise<number | undefined>
  updateOverdueTasksToToday: () => Promise<number | undefined>
}

export function useDevTasks(input: {
  projectId: DevTaskProjectFilter | undefined
  type: DevTaskTypeFilter | undefined
}): UseDevTasksResult {
  const { projectId, type } = input

  const shouldFetch = projectId !== undefined
  const key = shouldFetch ? ['dev-tasks', projectId, type ?? 'all'] : null

  const {
    data = [],
    error,
    isLoading,
  } = useSWR<DevTask[]>(key, () =>
    fetcher(() =>
      getDevTasks({
        projectId: projectId as DevTaskProjectFilter,
        type,
      }),
    ),
  )

  const refreshTasks = async (): Promise<DevTask[] | undefined> => {
    if (!key) return
    return await mutate(key)
  }

  const handleCreateTask = async (createInput: CreateDevTaskInput) => {
    const result = await createDevTask(createInput)
    await Promise.all([refreshTasks(), mutate(devCalendarTasksKey)])
    return result
  }

  const handleUpdateTask = async (
    id: number,
    updateInput: UpdateDevTaskInput,
  ) => {
    const result = await updateDevTask(id, updateInput)
    await Promise.all([refreshTasks(), mutate(devCalendarTasksKey)])
    return result
  }

  const handleDeleteTask = async (id: number) => {
    await deleteDevTask(id)
    await Promise.all([refreshTasks(), mutate(devCalendarTasksKey)])
    return true
  }

  const handleToggleTaskCompletion = async (
    id: number,
    completed: boolean,
  ): Promise<void> => {
    await updateDevTask(id, { completed })
    await Promise.all([refreshTasks(), mutate(devCalendarTasksKey)])
  }

  const handleDeleteCompletedTasks = async () => {
    if (projectId === undefined) return
    const count = await deleteCompletedDevTasks({
      projectId,
      type,
    })
    await Promise.all([refreshTasks(), mutate(devCalendarTasksKey)])
    return count
  }

  const handleUpdateOverdueTasksToToday = async () => {
    if (projectId === undefined) return
    const count = await updateOverdueDevTasksToToday({
      projectId,
      type,
    })
    await Promise.all([refreshTasks(), mutate(devCalendarTasksKey)])
    return count
  }

  return {
    tasks: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch dev tasks'
      : null,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    toggleTaskCompletion: handleToggleTaskCompletion,
    deleteCompletedTasks: handleDeleteCompletedTasks,
    updateOverdueTasksToToday: handleUpdateOverdueTasksToToday,
  }
}

