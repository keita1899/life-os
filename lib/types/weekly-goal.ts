export interface WeeklyGoal {
  id: number
  title: string
  year: number
  weekStartDate: string
  createdAt: string
  updatedAt: string
}

export interface CreateWeeklyGoalInput {
  title: string
  weekStartDate: string
}

export interface UpdateWeeklyGoalInput {
  title?: string
  year?: number
  weekStartDate?: string
}
