'use client'

import Link from 'next/link'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { MemoMarkdown } from './MemoMarkdown'
import type { DevMemo } from '../types/dev-memo'

interface MemoCardProps {
  memo: DevMemo
  projectName?: string | null
  onEdit: (memo: DevMemo) => void
  onDelete: (memo: DevMemo) => void
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ja-JP', {
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
  const { copy, copied } = useCopyToClipboard({ resetDelayMs: 2000 })

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    void copy(memo.content)
  }

  return (
    <div className="group w-full rounded-lg border border-stone-200 p-4 dark:border-stone-800">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDateTime(memo.createdAt)}</span>
            {memo.projectId != null && (
              projectName ? (
                <Link
                  href={`/dev/projects/project?id=${memo.projectId}`}
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {projectName}
                </Link>
              ) : (
                <Link
                  href={`/dev/projects/project?id=${memo.projectId}`}
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  プロジェクト #{memo.projectId}
                </Link>
              )
            )}
          </div>
          <div className="break-words">
            <MemoMarkdown content={memo.content} />
          </div>
          {memo.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {memo.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleCopy}
            aria-label={copied ? 'コピーしました' : '本文をコピー'}
          >
            {copied ? (
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
