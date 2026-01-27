export interface VisionCategory {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateVisionCategoryInput {
  name: string
}

export interface UpdateVisionCategoryInput {
  name?: string
}
