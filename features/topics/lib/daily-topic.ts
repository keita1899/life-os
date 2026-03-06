/**
 * 日付文字列から決定的にアイテムインデックスを1つ選ぶユーティリティ。
 * 同じ日なら常に同じ結果を返す。
 */
export function getDailyTopicIndex(dateString: string, totalItems: number): number {
  if (totalItems <= 0) return 0

  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash * 31 + dateString.charCodeAt(i)) | 0
  }

  return Math.abs(hash) % totalItems
}
