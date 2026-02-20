'use client'

import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { EmptyState } from '@/components/ui/empty-state'
import { MemoCard } from './MemoCard'
import type { DevMemo } from '../types/dev-memo'
import type { DevProject } from '@/features/dev/projects'

interface MemoListProps {
  memos: DevMemo[]
  projects?: DevProject[]
  selectedTag?: string | null
  onTagSelect?: (tag: string | null) => void
  onEdit: (memo: DevMemo) => void
  onDelete: (memo: DevMemo) => void
}

export function MemoList({
  memos,
  projects = [],
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
    if (!selectedTag) return memos
    return memos.filter((m) => m.tags.includes(selectedTag))
  }, [memos, selectedTag])

  if (memos.length === 0) {
    return <EmptyState message="メモがありません" />
  }

  return (
    <div className="space-y-4">
      {onTagSelect && allTags.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-1 min-w-0">
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
          <EmptyState message="このタグのメモはありません" />
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
