export interface BucketListCategory {
  id: number
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateBucketListCategoryInput {
  name: string
}

export interface UpdateBucketListCategoryInput {
  name?: string
  sortOrder?: number
}
