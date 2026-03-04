export interface VisionCategory {
  id: number
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateVisionCategoryInput {
  name: string
}

export interface UpdateVisionCategoryInput {
  name?: string
  sortOrder?: number
}
