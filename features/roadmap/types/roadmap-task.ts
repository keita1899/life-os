export interface RoadmapTask {
  id: number
  title: string
  projectId: number
  sectionId: number | null
  targetYear: number | null
  targetMonth: number | null
  completed: boolean
  achievedDate: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateRoadmapTaskInput {
  title: string
  projectId: number
  sectionId?: number | null
  targetYear?: number | null
  targetMonth?: number | null
}

export interface UpdateRoadmapTaskInput {
  title?: string
  sectionId?: number | null
  targetYear?: number | null
  targetMonth?: number | null
  completed?: boolean
  achievedDate?: string | null
  order?: number
}
