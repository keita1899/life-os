import { getTodayDateString } from '@/lib/date/formats'
import type { BucketListItem } from '@/lib/types/bucket-list-item'

export function getDateFromBucketItem(item: BucketListItem): string {
  if (item.targetYear != null && item.targetMonth != null) {
    const month = String(item.targetMonth).padStart(2, '0')
    return `${item.targetYear}-${month}-01`
  }
  return getTodayDateString()
}
