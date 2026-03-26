export type RoadmapSectionStatus = 'in_progress' | 'planned' | 'done'

export interface RoadmapSection {
  id: number
  name: string
  projectId: number
  sortOrder: number
  status: RoadmapSectionStatus
  createdAt: string
  updatedAt: string
}

export interface CreateRoadmapSectionInput {
  name: string
  projectId: number
}

export interface UpdateRoadmapSectionInput {
  name?: string
  sortOrder?: number
  status?: RoadmapSectionStatus
}

export const SECTION_STATUS_LABELS: Record<RoadmapSectionStatus, string> = {
  in_progress: '進行中',
  planned: '予定',
  done: '完了',
}
