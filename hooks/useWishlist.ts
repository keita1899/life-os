import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createWishlistItem,
  getAllWishlistItems,
  updateWishlistItem,
  deleteWishlistItem,
  deleteCompletedWishlistItems,
} from '@/lib/wishlist'
import type {
  WishlistItem,
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
} from '@/lib/types/wishlist-item'
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
    await createWishlistItem(input)
    await mutate(wishlistKey)
  }

  const handleUpdateWishlistItem = async (
    id: number,
    input: UpdateWishlistItemInput,
  ) => {
    await updateWishlistItem(id, input)
    await mutate(wishlistKey)
  }

  const handleDeleteWishlistItem = async (id: number) => {
    await deleteWishlistItem(id)
    await mutate(wishlistKey)
  }

  const handleToggleWishlistItemCompletion = async (
    id: number,
    completed: boolean,
  ) => {
    await updateWishlistItem(id, { completed })
    await mutate(wishlistKey)
  }

  const handleDeleteCompletedWishlistItems = async () => {
    await deleteCompletedWishlistItems()
    await mutate(wishlistKey)
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
    toggleWishlistItemCompletion: handleToggleWishlistItemCompletion,
    deleteCompletedWishlistItems: handleDeleteCompletedWishlistItems,
    refreshWishlist: () => mutate(wishlistKey),
  }
}
