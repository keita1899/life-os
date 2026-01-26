export interface YearlyGoal {
  id: number
  title: string
  year: number
  achieved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateYearlyGoalInput {
  title: string
  year?: number
}

export interface UpdateYearlyGoalInput {
  title?: string
  year?: number
}
