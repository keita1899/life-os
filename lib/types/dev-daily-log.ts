export interface DevDailyLog {
  id: number
  logDate: string
  report: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateDevDailyLogInput {
  logDate: string
  report?: string | null
}

export interface UpdateDevDailyLogInput {
  report?: string | null
}
