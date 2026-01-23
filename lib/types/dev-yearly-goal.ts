export interface DevYearlyGoal {
  id: number
  title: string
  targetDate: string | null
  year: number
  achieved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDevYearlyGoalInput {
  title: string
  targetDate?: string | null
  year?: number
}

export interface UpdateDevYearlyGoalInput {
  title?: string
  targetDate?: string | null
  year?: number
}
