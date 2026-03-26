import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getSectionsByProjectId,
  createRoadmapSection,
  updateRoadmapSection,
  deleteRoadmapSection,
  reorderRoadmapSections,
} from '../lib'
import type {
  RoadmapSection,
  CreateRoadmapSectionInput,
  UpdateRoadmapSectionInput,
} from '../types/roadmap-section'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useRoadmapSections(projectId: number | null) {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<RoadmapSection[]>(
    projectId !== null ? SWR_KEYS.roadmapSections(projectId) : null,
    () => getSectionsByProjectId(projectId!),
  )

  const handleCreate = async (
    input: CreateRoadmapSectionInput,
  ): Promise<RoadmapSection> => {
    const result = await createRoadmapSection(input)
    if (projectId !== null) {
      await mutate(SWR_KEYS.roadmapSections(projectId))
    }
    return result
  }

  const handleUpdate = async (
    id: number,
    input: UpdateRoadmapSectionInput,
  ): Promise<true> => {
    await updateRoadmapSection(id, input)
    if (projectId !== null) {
      await mutate(SWR_KEYS.roadmapSections(projectId))
    }
    return true
  }

  const handleDelete = async (id: number): Promise<true> => {
    await deleteRoadmapSection(id)
    if (projectId !== null) {
      await Promise.all([
        mutate(SWR_KEYS.roadmapSections(projectId)),
        mutate(SWR_KEYS.roadmapTasks(projectId)),
      ])
    }
    return true
  }

  const handleReorder = async (
    updates: { id: number; sortOrder: number }[],
  ): Promise<void> => {
    await reorderRoadmapSections(updates)
    if (projectId !== null) {
      await mutate(SWR_KEYS.roadmapSections(projectId))
    }
  }

  return {
    sections: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch roadmap sections'
      : null,
    createSection: handleCreate,
    updateSection: handleUpdate,
    deleteSection: handleDelete,
    reorderSections: handleReorder,
  }
}
