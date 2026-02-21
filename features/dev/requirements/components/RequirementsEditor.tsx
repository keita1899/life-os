'use client'

import type { ReactElement } from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { AutoResizeTextarea } from '@/components/ui/textarea-autosize'
import { RequirementsMarkdown } from './RequirementsMarkdown'
import { cn } from '@/lib/utils'
import { FileText, Eye, SplitSquareVertical, Save } from 'lucide-react'

export type RequirementsViewMode = 'form' | 'preview' | 'split'

interface RequirementsEditorProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
}

export function RequirementsEditor({
  initialContent,
  onSave,
}: RequirementsEditorProps): ReactElement {
  const [content, setContent] = useState(initialContent)
  const [viewMode, setViewMode] = useState<RequirementsViewMode>('split')
  const [isSaving, setIsSaving] = useState(false)
  const lastSavedContentRef = useRef(initialContent)

  useEffect(() => {
    if (content === lastSavedContentRef.current) {
      setContent(initialContent)
      lastSavedContentRef.current = initialContent
    }
  }, [initialContent, content])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(content)
      lastSavedContentRef.current = content
    } finally {
      setIsSaving(false)
    }
  }, [content, onSave])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex h-10 box-border items-center rounded-md border border-input">
          <button
            type="button"
            onClick={() => setViewMode('form')}
            title="編集"
            className={cn(
              'rounded p-2 transition-colors',
              viewMode === 'form'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
            )}
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            title="プレビュー"
            className={cn(
              'rounded p-2 transition-colors',
              viewMode === 'preview'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
            )}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            title="両方"
            className={cn(
              'rounded p-2 transition-colors',
              viewMode === 'split'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
            )}
          >
            <SplitSquareVertical className="h-4 w-4" />
          </button>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-10 gap-2"
        >
          <Save className="h-4 w-4" />
          保存
        </Button>
      </div>

      <div
        className={
          viewMode === 'split'
            ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
            : undefined
        }
      >
        {(viewMode === 'form' || viewMode === 'split') && (
          <div className="min-h-[320px]">
            <AutoResizeTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="マークダウンで記述"
              minRows={16}
              className="font-mono text-sm"
            />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="min-h-[320px] rounded-md border border-input bg-muted/30 p-4">
            <RequirementsMarkdown content={content || '*（未入力）*'} />
          </div>
        )}
      </div>
    </div>
  )
}
