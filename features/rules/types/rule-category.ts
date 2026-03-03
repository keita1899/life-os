export interface RuleCategory {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateRuleCategoryInput {
  name: string
}

export interface UpdateRuleCategoryInput {
  name?: string
}
