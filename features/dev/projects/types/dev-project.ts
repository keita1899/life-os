export type ProjectStatus = 'draft' | 'in_progress' | 'released'

export interface DevProject {
  id: number
  name: string
  startDate: string | null
  endDate: string | null
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

export interface CreateDevProjectInput {
  name: string
  startDate?: string | null
  endDate?: string | null
  status?: ProjectStatus
}

export interface UpdateDevProjectInput {
  name?: string
  startDate?: string | null
  endDate?: string | null
  status?: ProjectStatus
}
