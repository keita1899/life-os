import type { InterviewCategory } from './interview-category'

export interface InterviewItem {
  id: number
  question: string
  answer: string | null
  categoryId: number | null
  category: InterviewCategory | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateInterviewItemInput {
  question: string
  answer?: string | null
  categoryId?: number | null
}

export interface UpdateInterviewItemInput {
  question?: string
  answer?: string | null
  categoryId?: number | null
  order?: number
}
