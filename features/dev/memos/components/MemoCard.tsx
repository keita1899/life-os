'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { parseUtcTimestamp } from '@/lib/date/formats'
import { MemoMarkdown } from './MemoMarkdown'
import type { DevMemo } from '../types/dev-memo'
import { MEMO_CATEGORY_LABEL_MAP } from '../lib/categories'

interface MemoCardProps {
  memo: DevMemo
  projectName?: string | null
  onEdit: (memo: DevMemo) => void
  onDelete: (memo: DevMemo) => void
}

function formatDateTime(dateStr: string): string {
  return parseUtcTimestamp(dateStr).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MemoCard({
  memo,
  projectName,
  onEdit,
  onDelete,
}: MemoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setIsOverflowing(node.scrollHeight > node.clientHeight)
    }
  }, [])
  const { copy, isCopied } = useCopyToClipboard({ resetDelayMs: 2000 })

  const handleToggle = () => {
    setIsExpanded((prev) => !prev)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    void copy(memo.content)
  }

  return (
    <div
      className="group w-full cursor-pointer rounded-lg border border-stone-200 p-4 dark:border-stone-800"
      onClick={handleToggle}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDateTime(memo.createdAt)}</span>
            {memo.category != null && MEMO_CATEGORY_LABEL_MAP[memo.category] && (
              <Badge variant="outline" className="text-xs">
                {MEMO_CATEGORY_LABEL_MAP[memo.category]}
              </Badge>
            )}
            {memo.projectId != null && (
              projectName ? (
                <Link
                  href={`/dev/projects/project?id=${memo.projectId}`}
                  className="underline underline-offset-2 hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  {projectName}
                </Link>
              ) : (
                <Link
                  href={`/dev/projects/project?id=${memo.projectId}`}
                  className="underline underline-offset-2 hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  プロジェクト #{memo.projectId}
                </Link>
              )
            )}
          </div>
          {memo.title && (
            <h3 className="mb-1 text-sm font-semibold">{memo.title}</h3>
          )}
          <div
            ref={!isExpanded ? contentRef : undefined}
            className={`relative break-words ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}
          >
            <MemoMarkdown content={memo.content} />
            {!isExpanded && isOverflowing && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>
          {(isOverflowing || isExpanded) && (
            <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>折りたたむ</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>もっと見る</span>
                </>
              )}
            </div>
          )}
          {memo.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {memo.tags.map((tag, index) => (
                <Badge
                  key={`${tag}-${index}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div
          className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleCopy}
            aria-label={isCopied ? 'コピーしました' : '本文をコピー'}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <EditDeleteDropdownMenu
            onEdit={() => onEdit(memo)}
            onDelete={() => onDelete(memo)}
          />
        </div>
      </div>
    </div>
  )
}
