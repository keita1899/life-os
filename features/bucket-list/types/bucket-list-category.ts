export interface BucketListCategory {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateBucketListCategoryInput {
  name: string
}

export interface UpdateBucketListCategoryInput {
  name?: string
}
