export interface WishlistCategory {
  id: number
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateWishlistCategoryInput {
  name: string
}

export interface UpdateWishlistCategoryInput {
  name?: string
  sortOrder?: number
}
