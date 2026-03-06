'use client'

import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { EmptyState } from '@/components/ui/empty-state'
import { MemoCard } from './MemoCard'
import type { DevMemo } from '../types/dev-memo'
import type { DevProject } from '@/features/dev/projects'
import { MEMO_CATEGORIES } from '../lib/categories'

interface MemoListProps {
  memos: DevMemo[]
  projects?: DevProject[]
  selectedCategory?: string | null
  onCategorySelect?: (category: string | null) => void
  selectedTag?: string | null
  onTagSelect?: (tag: string | null) => void
  onEdit: (memo: DevMemo) => void
  onDelete: (memo: DevMemo) => void
}

export function MemoList({
  memos,
  projects = [],
  selectedCategory = null,
  onCategorySelect,
  selectedTag = null,
  onTagSelect,
  onEdit,
  onDelete,
}: MemoListProps): ReactElement {
  const projectMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const p of projects) {
      map.set(p.id, p.name)
    }
    return map
  }, [projects])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const m of memos) {
      for (const t of m.tags) {
        if (t.trim()) set.add(t.trim())
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [memos])

  const filteredMemos = useMemo(() => {
    let result = memos
    if (selectedCategory) {
      result = result.filter((m) => m.category === selectedCategory)
    }
    if (selectedTag) {
      result = result.filter((m) =>
        m.tags.some((t) => t.trim() === selectedTag),
      )
    }
    return result
  }, [memos, selectedCategory, selectedTag])

  if (memos.length === 0) {
    return <EmptyState message="メモがありません" />
  }

  return (
    <div className="space-y-4">
      {onCategorySelect && (
        <div className="overflow-x-auto">
          <div className="flex items-center gap-2 pb-1 min-w-0">
            <span className="flex-shrink-0 text-xs text-muted-foreground">カテゴリー</span>
            <button
              type="button"
              onClick={() => onCategorySelect(null)}
              className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                !selectedCategory
                  ? 'border-slate-800 bg-slate-800 text-white dark:border-slate-400 dark:bg-slate-400 dark:text-slate-900'
                  : 'border-slate-300 text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-500'
              }`}
            >
              すべて
            </button>
            {MEMO_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => onCategorySelect(selectedCategory === cat.value ? null : cat.value)}
                className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selectedCategory === cat.value
                    ? 'border-slate-800 bg-slate-800 text-white dark:border-slate-400 dark:bg-slate-400 dark:text-slate-900'
                    : 'border-slate-300 text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-500'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {onTagSelect && allTags.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex items-center gap-2 pb-1 min-w-0">
            <span className="flex-shrink-0 text-xs text-muted-foreground">タグ</span>
            <button
              type="button"
              onClick={() => onTagSelect(null)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
                !selectedTag
                  ? 'bg-slate-800 text-white dark:bg-slate-400 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              すべて
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
                  selectedTag === tag
                    ? 'bg-slate-800 text-white dark:bg-slate-400 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {filteredMemos.length === 0 ? (
          <EmptyState message="該当するメモはありません" />
        ) : (
          filteredMemos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              projectName={
                memo.projectId != null
                  ? projectMap.get(memo.projectId) ?? null
                  : null
              }
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
