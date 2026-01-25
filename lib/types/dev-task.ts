export interface DevTask {
  id: number
  title: string
  projectId: number | null
  type: 'inbox' | 'learning'
  executionDate: string | null
  completed: boolean
  order: number
  actualTime: number
  createdAt: string
  updatedAt: string
}

export interface CreateDevTaskInput {
  title: string
  projectId: number | null
  type: 'inbox' | 'learning'
  executionDate?: string | null
}

export interface UpdateDevTaskInput {
  title?: string
  projectId?: number | null
  type?: 'inbox' | 'learning'
  executionDate?: string | null
  completed?: boolean
  order?: number
  actualTime?: number
}

