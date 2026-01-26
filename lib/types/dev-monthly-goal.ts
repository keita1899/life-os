export interface DevMonthlyGoal {
  id: number
  title: string
  year: number
  month: number
  achieved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDevMonthlyGoalInput {
  title: string
  year?: number
  month: number
}

export interface UpdateDevMonthlyGoalInput {
  title?: string
  year?: number
  month?: number
}
