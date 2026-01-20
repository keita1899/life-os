export interface DailyLog {
  id: number
  logDate: string
  diary: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateDailyLogInput {
  logDate: string
  diary?: string | null
}

export interface UpdateDailyLogInput {
  diary?: string | null
}
