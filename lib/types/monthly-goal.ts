export interface MonthlyGoal {
  id: number
  title: string
  year: number
  month: number
  achieved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMonthlyGoalInput {
  title: string
  year?: number
  month: number
}

export interface UpdateMonthlyGoalInput {
  title?: string
  year?: number
  month?: number
}
