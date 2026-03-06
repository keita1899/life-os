export interface TopicCategory {
  id: number
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateTopicCategoryInput {
  name: string
}

export interface UpdateTopicCategoryInput {
  name?: string
  sortOrder?: number
}
