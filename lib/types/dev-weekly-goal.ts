export interface DevWeeklyGoal {
  id: number
  title: string
  year: number
  weekStartDate: string
  achieved: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDevWeeklyGoalInput {
  title: string
  weekStartDate: string
}

export interface UpdateDevWeeklyGoalInput {
  title?: string
  year?: number
  weekStartDate?: string
}
