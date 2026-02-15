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
import { AutoResizeTextarea } from '@/components/ui/textarea-autosize'
import { Loader2 } from 'lucide-react'
import type { DevDailyLog, UpdateDevDailyLogInput } from '../types/dev-daily-log'

const AUTO_SAVE_DELAY_MS = 800

const reportFormSchema = z.object({
  report: z.string().optional(),
})

type ReportFormValues = z.infer<typeof reportFormSchema>

interface DevLogReportSectionProps {
  devDailyLog: DevDailyLog | null | undefined
  isLoading: boolean
  onUpdate: (input: UpdateDevDailyLogInput) => Promise<void>
}

export function DevLogReportSection({
  devDailyLog,
  isLoading: isLoadingLog,
  onUpdate,
}: DevLogReportSectionProps) {
  const lastSavedRef = useRef<string>(devDailyLog?.report ?? '')
  const onUpdateRef = useRef(onUpdate)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)

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
      const normalized = value.trim() || null
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
          <CardTitle className="text-lg">日報</CardTitle>
          {isSaving && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              保存中...
            </span>
          )}
          {savedMessage && !isSaving && (
            <span className="text-sm text-muted-foreground">保存しました</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingLog ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="report"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <AutoResizeTextarea
                        {...field}
                        ref={field.ref}
                        placeholder="今日の日報を書いてください..."
                        className="min-h-[200px] overflow-hidden"
                        minRows={8}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
