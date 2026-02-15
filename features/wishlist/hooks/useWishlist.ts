import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createWishlistItem,
  getAllWishlistItems,
  updateWishlistItem,
  deleteWishlistItem,
  deleteWishlistItemsByIds,
} from '../lib'
import type {
  WishlistItem,
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
} from '../types/wishlist-item'
import { fetcher } from '@/lib/swr'

const wishlistKey = 'wishlist'

export function useWishlist() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<WishlistItem[]>(wishlistKey, () =>
    fetcher(() => getAllWishlistItems()),
  )

  const handleCreateWishlistItem = async (input: CreateWishlistItemInput) => {
    const result = await createWishlistItem(input)
    await mutate(wishlistKey)
    return result
  }

  const handleUpdateWishlistItem = async (
    id: number,
    input: UpdateWishlistItemInput,
  ) => {
    const result = await updateWishlistItem(id, input)
    await mutate(wishlistKey)
    return result
  }

  const handleDeleteWishlistItem = async (id: number) => {
    await deleteWishlistItem(id)
    await mutate(wishlistKey)
    return true
  }

  const handleDeleteWishlistItemsByIds = async (ids: number[]) => {
    await deleteWishlistItemsByIds(ids)
    await mutate(wishlistKey)
    return true
  }

  return {
    items: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch wishlist items'
      : null,
    createWishlistItem: handleCreateWishlistItem,
    updateWishlistItem: handleUpdateWishlistItem,
    deleteWishlistItem: handleDeleteWishlistItem,
    deleteWishlistItemsByIds: handleDeleteWishlistItemsByIds,
  }
}
