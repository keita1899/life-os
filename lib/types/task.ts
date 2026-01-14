export interface Task {
  id: number
  title: string
  executionDate: string | null
  completed: boolean
  order: number
  actualTime: number
  estimatedTime: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  executionDate?: string | null
  estimatedTime?: number | null
}

export interface UpdateTaskInput {
  title?: string
  executionDate?: string | null
  completed?: boolean
  order?: number
  actualTime?: number
  estimatedTime?: number | null
}
