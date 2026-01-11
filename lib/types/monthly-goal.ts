export interface MonthlyGoal {
  id: number
  title: string
  targetDate: string | null
  year: number
  month: number
  createdAt: string
  updatedAt: string
}

export interface CreateMonthlyGoalInput {
  title: string
  targetDate?: string | null
  year?: number
  month: number
}

export interface UpdateMonthlyGoalInput {
  title?: string
  targetDate?: string | null
  year?: number
  month?: number
}
