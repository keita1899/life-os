export type GoalPeriodType = 'yearly' | 'monthly'

export interface Goal {
  id: number
  title: string
  targetDate: string | null
  periodType: GoalPeriodType
  createdAt: string
  updatedAt: string
}

export interface CreateGoalInput {
  title: string
  targetDate?: string
  periodType?: GoalPeriodType
}

export interface UpdateGoalInput {
  title?: string
  targetDate?: string | null
  periodType?: GoalPeriodType
}
