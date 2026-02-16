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
import { SWR_KEYS } from '@/lib/swr-keys'

export function useWishlistCategories() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<WishlistCategory[]>(SWR_KEYS.wishlistCategories, () =>
    getAllWishlistCategories(),
  )

  const handleCreateWishlistCategory = async (
    input: CreateWishlistCategoryInput,
  ): Promise<WishlistCategory> => {
    const newCategory = await createWishlistCategory(input)
    await mutate(SWR_KEYS.wishlistCategories)
    return newCategory
  }

  const handleUpdateWishlistCategory = async (
    id: number,
    input: UpdateWishlistCategoryInput,
  ): Promise<true> => {
    await updateWishlistCategory(id, input)
    await Promise.all([
      mutate(SWR_KEYS.wishlistCategories),
      mutate(SWR_KEYS.wishlist),
    ])
    return true
  }

  const handleDeleteWishlistCategory = async (id: number): Promise<true> => {
    await deleteWishlistCategory(id)
    await Promise.all([
      mutate(SWR_KEYS.wishlistCategories),
      mutate(SWR_KEYS.wishlist),
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
    refreshCategories: () => mutate(SWR_KEYS.wishlistCategories),
  }
}
