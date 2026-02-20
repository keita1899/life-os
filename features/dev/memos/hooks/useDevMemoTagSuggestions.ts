import { useMemo } from 'react'
import { useDevMemos } from './useDevMemos'

export function useDevMemoTagSuggestions(): string[] {
  const { memos } = useDevMemos()
  return useMemo(() => {
    const set = new Set<string>()
    for (const m of memos) {
      for (const t of m.tags) {
        set.add(t)
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [memos])
}
