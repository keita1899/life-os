import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllRoadmapProjects,
  createRoadmapProject,
  updateRoadmapProject,
  deleteRoadmapProject,
  reorderRoadmapProjects,
} from '../lib'
import type {
  RoadmapProject,
  CreateRoadmapProjectInput,
  UpdateRoadmapProjectInput,
} from '../types/roadmap-project'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useRoadmapProjects() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<RoadmapProject[]>(SWR_KEYS.roadmapProjects, () =>
    getAllRoadmapProjects(),
  )

  const handleCreate = async (
    input: CreateRoadmapProjectInput,
  ): Promise<RoadmapProject> => {
    const result = await createRoadmapProject(input)
    await mutate(SWR_KEYS.roadmapProjects)
    return result
  }

  const handleUpdate = async (
    id: number,
    input: UpdateRoadmapProjectInput,
  ): Promise<true> => {
    await updateRoadmapProject(id, input)
    await mutate(SWR_KEYS.roadmapProjects)
    return true
  }

  const handleDelete = async (id: number): Promise<true> => {
    await deleteRoadmapProject(id)
    await mutate(SWR_KEYS.roadmapProjects)
    return true
  }

  const handleReorder = async (
    updates: { id: number; sortOrder: number }[],
  ): Promise<void> => {
    await reorderRoadmapProjects(updates)
    await mutate(SWR_KEYS.roadmapProjects)
  }

  return {
    projects: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch roadmap projects'
      : null,
    createProject: handleCreate,
    updateProject: handleUpdate,
    deleteProject: handleDelete,
    reorderProjects: handleReorder,
  }
}
