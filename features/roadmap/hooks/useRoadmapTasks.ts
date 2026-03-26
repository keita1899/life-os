import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getTasksByProjectId,
  createRoadmapTask,
  updateRoadmapTask,
  deleteRoadmapTask,
  updateTaskSection,
  reorderRoadmapTasks,
} from '../lib'
import type {
  RoadmapTask,
  CreateRoadmapTaskInput,
  UpdateRoadmapTaskInput,
} from '../types/roadmap-task'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useRoadmapTasks(projectId: number | null) {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<RoadmapTask[]>(
    projectId !== null ? SWR_KEYS.roadmapTasks(projectId) : null,
    () => getTasksByProjectId(projectId!),
  )

  const mutateTasks = async () => {
    if (projectId !== null) {
      await mutate(SWR_KEYS.roadmapTasks(projectId))
    }
  }

  const mutateTasksAndCounts = async () => {
    await Promise.all([
      mutateTasks(),
      mutate(SWR_KEYS.roadmapTaskCounts),
    ])
  }

  const handleCreate = async (
    input: CreateRoadmapTaskInput,
  ): Promise<RoadmapTask> => {
    const result = await createRoadmapTask(input)
    await mutateTasksAndCounts()
    return result
  }

  const handleUpdate = async (
    id: number,
    input: UpdateRoadmapTaskInput,
  ): Promise<RoadmapTask> => {
    const result = await updateRoadmapTask(id, input)
    // completed 変更があればカウントも更新
    if (input.completed !== undefined) {
      await mutateTasksAndCounts()
    } else {
      await mutateTasks()
    }
    return result
  }

  const handleDelete = async (id: number): Promise<true> => {
    await deleteRoadmapTask(id)
    await mutateTasksAndCounts()
    return true
  }

  const handleToggleCompletion = async (
    id: number,
    completed: boolean,
  ): Promise<void> => {
    await updateRoadmapTask(id, { completed })
    await mutateTasksAndCounts()
  }

  const handleUpdateSection = async (
    id: number,
    sectionId: number | null,
  ): Promise<void> => {
    await updateTaskSection(id, sectionId)
    await mutateTasks()
  }

  const handleReorder = async (
    updates: { id: number; order: number }[],
  ): Promise<void> => {
    await reorderRoadmapTasks(updates)
    await mutateTasks()
  }

  return {
    tasks: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch roadmap tasks'
      : null,
    createTask: handleCreate,
    updateTask: handleUpdate,
    deleteTask: handleDelete,
    toggleTaskCompletion: handleToggleCompletion,
    updateTaskSection: handleUpdateSection,
    reorderTasks: handleReorder,
  }
}
