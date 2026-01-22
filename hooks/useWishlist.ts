import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createWishlistItem,
  getAllWishlistItems,
  updateWishlistItem,
  deleteWishlistItem,
  deletePurchasedWishlistItems,
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

  const handleToggleWishlistItemPurchased = async (
    id: number,
    purchased: boolean,
  ) => {
    await updateWishlistItem(id, { purchased })
    await mutate(wishlistKey)
  }

  const handleDeletePurchasedWishlistItems = async () => {
    await deletePurchasedWishlistItems()
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
    toggleWishlistItemPurchased: handleToggleWishlistItemPurchased,
    deletePurchasedWishlistItems: handleDeletePurchasedWishlistItems,
    refreshWishlist: () => mutate(wishlistKey),
  }
}
