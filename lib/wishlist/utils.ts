import type { WishlistItem } from '../types/wishlist-item'

export function calculateTotalPrice(items: WishlistItem[]): number {
  return items
    .filter((item) => !item.purchased && item.price !== null)
    .reduce((sum, item) => sum + (item.price || 0), 0)
}
