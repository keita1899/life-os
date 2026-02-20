import { useMemo } from 'react'
import { useDevMemos } from './useDevMemos'

export function useDevMemoTagSuggestions(): string[] {
  const { memos } = useDevMemos()
  return useMemo(() => {
    const set = new Set<string>()
    for (const memo of memos) {
      for (const tag of memo.tags) {
        set.add(tag)
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [memos])
}
