import type { TopicCategory } from './topic-category'

export interface TopicItem {
  id: number
  question: string
  answer: string | null
  categoryId: number | null
  category: TopicCategory | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateTopicItemInput {
  question: string
  answer?: string | null
  categoryId?: number | null
}

export interface UpdateTopicItemInput {
  question?: string
  answer?: string | null
  categoryId?: number | null
  order?: number
}
