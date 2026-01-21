export interface YearlyGoal {
  id: number
  title: string
  targetDate: string | null
  year: number
  achieved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateYearlyGoalInput {
  title: string
  targetDate?: string | null
  year?: number
}

export interface UpdateYearlyGoalInput {
  title?: string
  targetDate?: string | null
  year?: number
}
