export interface DevYearlyGoal {
  id: number
  title: string
  year: number
  achieved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDevYearlyGoalInput {
  title: string
  year?: number
}

export interface UpdateDevYearlyGoalInput {
  title?: string
  year?: number
}
