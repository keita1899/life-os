export interface GoalsTableConfig {
  yearly: {
    table: string
    columns: readonly string[]
  }
  monthly: {
    table: string
    columns: readonly string[]
  }
  weekly: {
    table: string
    columns: readonly string[]
  }
  errorContext: string
}
