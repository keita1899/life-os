import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllWishlistCategories,
  createWishlistCategory,
  updateWishlistCategory,
  deleteWishlistCategory,
} from '@/lib/wishlist'
import type {
  WishlistCategory,
  CreateWishlistCategoryInput,
  UpdateWishlistCategoryInput,
} from '@/lib/types/wishlist-category'
import { fetcher } from '@/lib/swr'

const wishlistCategoriesKey = 'wishlist-categories'

export function useWishlistCategories() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<WishlistCategory[]>(wishlistCategoriesKey, () =>
    fetcher(() => getAllWishlistCategories()),
  )

  const handleCreateWishlistCategory = async (
    input: CreateWishlistCategoryInput,
  ) => {
    await createWishlistCategory(input)
    await mutate(wishlistCategoriesKey)
  }

  const handleUpdateWishlistCategory = async (
    id: number,
    input: UpdateWishlistCategoryInput,
  ) => {
    await updateWishlistCategory(id, input)
    await mutate(wishlistCategoriesKey)
  }

  const handleDeleteWishlistCategory = async (id: number) => {
    await deleteWishlistCategory(id)
    await mutate(wishlistCategoriesKey)
  }

  return {
    categories: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch wishlist categories'
      : null,
    createWishlistCategory: handleCreateWishlistCategory,
    updateWishlistCategory: handleUpdateWishlistCategory,
    deleteWishlistCategory: handleDeleteWishlistCategory,
    refreshCategories: () => mutate(wishlistCategoriesKey),
  }
}
