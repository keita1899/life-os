import type { RuleCategory } from './rule-category'

export interface RuleItem {
  id: number
  title: string
  categoryId: number | null
  category: RuleCategory | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateRuleItemInput {
  title: string
  categoryId?: number | null
}

export interface UpdateRuleItemInput {
  title?: string
  categoryId?: number | null
  order?: number
}
