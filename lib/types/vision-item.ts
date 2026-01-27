import type { VisionCategory } from './vision-category'

export interface VisionItem {
  id: number
  title: string
  categoryId: number | null
  category: VisionCategory | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateVisionItemInput {
  title: string
  categoryId?: number | null
}

export interface UpdateVisionItemInput {
  title?: string
  categoryId?: number | null
  order?: number
}
