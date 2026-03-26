'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownTextarea } from '@/components/ui/markdown-textarea'
import { RequirementsMarkdown } from '@/features/dev/requirements/components/RequirementsMarkdown'
import { FileText, Eye, SplitSquareVertical, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DevDailyLog, UpdateDevDailyLogInput } from '@/features/dev/logs/types/dev-daily-log'

type ViewMode = 'form' | 'preview' | 'split'

const AUTO_SAVE_DELAY_MS = 800

const reportFormSchema = z.object({
  report: z.string().optional(),
})

type ReportFormValues = z.infer<typeof reportFormSchema>

interface LogReportSectionProps {
  devDailyLog: DevDailyLog | null | undefined
  isLoading: boolean
  onUpdate: (input: UpdateDevDailyLogInput) => Promise<void>
}

export function LogReportSection({
  devDailyLog,
  isLoading: isLoadingLog,
  onUpdate,
}: LogReportSectionProps) {
  const lastSavedRef = useRef<string>(devDailyLog?.report ?? '')
  const onUpdateRef = useRef(onUpdate)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('form')

  onUpdateRef.current = onUpdate

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    values: {
      report: devDailyLog?.report || '',
    },
  })

  const reportValue = form.watch('report')

  useEffect(() => {
    lastSavedRef.current = devDailyLog?.report ?? ''
  }, [devDailyLog?.report])

  useEffect(() => {
    const value = reportValue ?? ''
    if (value === lastSavedRef.current) return

    const timeoutId = setTimeout(async () => {
      const normalized = value.trim() ? value : null
      setIsSaving(true)
      try {
        await onUpdateRef.current({ report: normalized })
        lastSavedRef.current = normalized ?? ''
        setSavedMessage(true)
      } finally {
        setIsSaving(false)
      }
    }, AUTO_SAVE_DELAY_MS)

    return () => clearTimeout(timeoutId)
  }, [reportValue])

  useEffect(() => {
    if (!savedMessage) return
    const id = setTimeout(() => setSavedMessage(false), 2000)
    return () => clearTimeout(id)
  }, [savedMessage])

  return (
    <Card className="border-stone-200/60 dark:border-stone-700/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">日報</CardTitle>
            <div className="flex h-8 box-border items-center rounded-md border border-input">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                title="編集"
                className={cn(
                  'rounded p-1.5 transition-colors',
                  viewMode === 'form'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                )}
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                title="プレビュー"
                className={cn(
                  'rounded p-1.5 transition-colors',
                  viewMode === 'preview'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                )}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                title="両方"
                className={cn(
                  'rounded p-1.5 transition-colors',
                  viewMode === 'split'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted',
                )}
              >
                <SplitSquareVertical className="h-3.5 w-3.5" />
              </button>
            </div>
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
      </CardHeader>
      <CardContent>
        {isLoadingLog ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div
            className={
              viewMode === 'split'
                ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
                : undefined
            }
          >
            {(viewMode === 'form' || viewMode === 'split') && (
              <Form {...form}>
                <form>
                  <FormField
                    control={form.control}
                    name="report"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MarkdownTextarea
                            {...field}
                            ref={field.ref}
                            placeholder="今日の日報を書いてください..."
                            className="min-h-[200px] overflow-hidden font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                            minRows={8}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className="min-h-[200px] rounded-md border border-input bg-muted/30 p-4">
                <RequirementsMarkdown content={reportValue || '*（未入力）*'} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
