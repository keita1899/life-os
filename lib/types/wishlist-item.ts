import type { WishlistCategory } from './wishlist-category'

export interface WishlistItem {
  id: number
  title: string
  categoryId: number | null
  category: WishlistCategory | null
  targetYear: number | null
  achievedDate: string | null
  completed: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateWishlistItemInput {
  title: string
  categoryId?: number | null
  targetYear?: number | null
}

export interface UpdateWishlistItemInput {
  title?: string
  categoryId?: number | null
  targetYear?: number | null
  achievedDate?: string | null
  completed?: boolean
  order?: number
}
