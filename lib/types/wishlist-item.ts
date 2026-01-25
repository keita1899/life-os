import type { WishlistCategory } from './wishlist-category'

export interface WishlistItem {
  id: number
  name: string
  categoryId: number | null
  category: WishlistCategory | null
  targetYear: number | null
  price: number | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateWishlistItemInput {
  name: string
  categoryId?: number | null
  targetYear?: number | null
  price?: number | null
}

export interface UpdateWishlistItemInput {
  name?: string
  categoryId?: number | null
  targetYear?: number | null
  price?: number | null
  order?: number
}
