export interface RoadmapProject {
  id: number
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateRoadmapProjectInput {
  name: string
}

export interface UpdateRoadmapProjectInput {
  name?: string
  sortOrder?: number
}
