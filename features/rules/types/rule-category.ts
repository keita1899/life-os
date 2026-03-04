export interface RuleCategory {
  id: number
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateRuleCategoryInput {
  name: string
}

export interface UpdateRuleCategoryInput {
  name?: string
  sortOrder?: number
}
