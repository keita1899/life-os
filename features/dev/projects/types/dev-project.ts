export type ProjectStatus = 'draft' | 'in_progress' | 'released'

export interface DevProject {
  id: number
  name: string
  startDate: string | null
  endDate: string | null
  status: ProjectStatus
  productionUrl: string | null
  githubUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateDevProjectInput {
  name: string
  startDate?: string | null
  endDate?: string | null
  status?: ProjectStatus
  productionUrl?: string | null
  githubUrl?: string | null
}

export interface UpdateDevProjectInput {
  name?: string
  startDate?: string | null
  endDate?: string | null
  status?: ProjectStatus
  productionUrl?: string | null
  githubUrl?: string | null
}
