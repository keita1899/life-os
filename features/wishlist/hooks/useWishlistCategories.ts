import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllWishlistCategories,
  createWishlistCategory,
  updateWishlistCategory,
  deleteWishlistCategory,
} from '../lib'
import type {
  WishlistCategory,
  CreateWishlistCategoryInput,
  UpdateWishlistCategoryInput,
} from '../types/wishlist-category'
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
  ): Promise<WishlistCategory> => {
    const newCategory = await createWishlistCategory(input)
    await mutate(wishlistCategoriesKey)
    return newCategory
  }

  const handleUpdateWishlistCategory = async (
    id: number,
    input: UpdateWishlistCategoryInput,
  ): Promise<true> => {
    await updateWishlistCategory(id, input)
    await Promise.all([
      mutate(wishlistCategoriesKey),
      mutate('wishlist'),
    ])
    return true
  }

  const handleDeleteWishlistCategory = async (id: number): Promise<true> => {
    await deleteWishlistCategory(id)
    await Promise.all([
      mutate(wishlistCategoriesKey),
      mutate('wishlist'),
    ])
    return true
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
