'use client'

import type { ReactElement } from 'react'
import { useState, useEffect, useRef } from 'react'
import { MarkdownTextarea } from '@/components/ui/markdown-textarea'
import { ReadmeMarkdown } from './ReadmeMarkdown'
import { cn } from '@/lib/utils'
import { FileText, Eye, SplitSquareVertical, Loader2, Copy, Check } from 'lucide-react'

export type ReadmeViewMode = 'form' | 'preview' | 'split'

const AUTO_SAVE_DELAY_MS = 800

interface ReadmeEditorProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
}

export function ReadmeEditor({
  initialContent,
  onSave,
}: ReadmeEditorProps): ReactElement {
  const [content, setContent] = useState(initialContent)
  const [viewMode, setViewMode] = useState<ReadmeViewMode>('split')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const lastSavedRef = useRef(initialContent)
  const onSaveRef = useRef(onSave)

  onSaveRef.current = onSave

  useEffect(() => {
    lastSavedRef.current = initialContent
    setContent(initialContent)
  }, [initialContent])

  useEffect(() => {
    if (content === lastSavedRef.current) return

    const timeoutId = setTimeout(async () => {
      setIsSaving(true)
      try {
        await onSaveRef.current(content)
        lastSavedRef.current = content
        setSavedMessage(true)
      } finally {
        setIsSaving(false)
      }
    }, AUTO_SAVE_DELAY_MS)

    return () => clearTimeout(timeoutId)
  }, [content])

  useEffect(() => {
    if (!savedMessage) return
    const id = setTimeout(() => setSavedMessage(false), 2000)
    return () => clearTimeout(id)
  }, [savedMessage])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={() => void handleCopy()}
            title="コピー"
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {isSaving && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              保存中...
            </>
          )}
          {savedMessage && !isSaving && (
            <span>保存しました</span>
          )}
        </div>
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
            <MarkdownTextarea
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
            <ReadmeMarkdown content={content || '*（未入力）*'} />
          </div>
        )}
      </div>
    </div>
  )
}
