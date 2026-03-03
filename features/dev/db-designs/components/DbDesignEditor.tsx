'use client'

import type { ReactElement } from 'react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { TableEditor } from './TableEditor'
import { MermaidRenderer } from './MermaidRenderer'
import { generateMermaidErDiagram } from '../lib/generate-mermaid'
import {
  parseDesignData,
  serializeDesignData,
  DEFAULT_DB_DESIGN_DATA,
} from '../lib/default-template'
import type { DbDesignData } from '../types/db-design-data'
import { cn } from '@/lib/utils'
import {
  TableProperties,
  Eye,
  SplitSquareVertical,
  Loader2,
} from 'lucide-react'

export type DbDesignViewMode = 'form' | 'preview' | 'split'

const AUTO_SAVE_DELAY_MS = 800

interface DbDesignEditorProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
}

export function DbDesignEditor({
  initialContent,
  onSave,
}: DbDesignEditorProps): ReactElement {
  const [data, setData] = useState<DbDesignData>(() => {
    return parseDesignData(initialContent) ?? DEFAULT_DB_DESIGN_DATA
  })
  const [viewMode, setViewMode] = useState<DbDesignViewMode>('split')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const lastSavedRef = useRef(initialContent)
  const onSaveRef = useRef(onSave)

  onSaveRef.current = onSave

  useEffect(() => {
    const parsed = parseDesignData(initialContent)
    if (parsed) {
      lastSavedRef.current = initialContent
      setData(parsed)
    }
  }, [initialContent])

  const serialized = useMemo(() => serializeDesignData(data), [data])
  const mermaidCode = useMemo(() => generateMermaidErDiagram(data), [data])

  useEffect(() => {
    if (serialized === lastSavedRef.current) return

    const timeoutId = setTimeout(async () => {
      setIsSaving(true)
      try {
        await onSaveRef.current(serialized)
        lastSavedRef.current = serialized
        setSavedMessage(true)
      } finally {
        setIsSaving(false)
      }
    }, AUTO_SAVE_DELAY_MS)

    return () => clearTimeout(timeoutId)
  }, [serialized])

  useEffect(() => {
    if (!savedMessage) return
    const id = setTimeout(() => setSavedMessage(false), 2000)
    return () => clearTimeout(id)
  }, [savedMessage])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex h-10 box-border items-center rounded-md border border-input">
          <button
            type="button"
            onClick={() => setViewMode('form')}
            title="フォーム"
            className={cn(
              'rounded p-2 transition-colors',
              viewMode === 'form'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
            )}
          >
            <TableProperties className="h-4 w-4" />
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
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {isSaving && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              保存中...
            </>
          )}
          {savedMessage && !isSaving && <span>保存しました</span>}
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
            <TableEditor data={data} onChange={setData} />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="min-h-[320px] rounded-md border border-input bg-muted/30 p-4">
            <MermaidRenderer content={mermaidCode} />
          </div>
        )}
      </div>
    </div>
  )
}
