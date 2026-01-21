import type { BucketListCategory } from './bucket-list-category'

export interface BucketListItem {
  id: number
  title: string
  categoryId: number | null
  category: BucketListCategory | null
  targetYear: number | null
  achievedDate: string | null
  completed: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateBucketListItemInput {
  title: string
  categoryId?: number | null
  targetYear?: number | null
}

export interface UpdateBucketListItemInput {
  title?: string
  categoryId?: number | null
  targetYear?: number | null
  achievedDate?: string | null
  completed?: boolean
  order?: number
}
