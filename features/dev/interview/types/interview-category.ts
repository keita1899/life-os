export interface InterviewCategory {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateInterviewCategoryInput {
  name: string
}

export interface UpdateInterviewCategoryInput {
  name?: string
}
