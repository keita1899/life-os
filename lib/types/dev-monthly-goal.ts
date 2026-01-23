export interface DevMonthlyGoal {
  id: number
  title: string
  targetDate: string | null
  year: number
  month: number
  achieved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDevMonthlyGoalInput {
  title: string
  targetDate?: string | null
  year?: number
  month: number
}

export interface UpdateDevMonthlyGoalInput {
  title?: string
  targetDate?: string | null
  year?: number
  month?: number
}
