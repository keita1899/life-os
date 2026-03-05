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
import { Loader2 } from 'lucide-react'
import type { DailyLog, UpdateDailyLogInput } from '../types/daily-log'

const AUTO_SAVE_DELAY_MS = 800

const diaryFormSchema = z.object({
  diary: z.string().optional(),
})

type DiaryFormValues = z.infer<typeof diaryFormSchema>

interface LogDiarySectionProps {
  dailyLog: DailyLog | null | undefined
  isLoading: boolean
  onUpdate: (input: UpdateDailyLogInput) => Promise<void>
}

export function LogDiarySection({
  dailyLog,
  isLoading: isLoadingLog,
  onUpdate,
}: LogDiarySectionProps) {
  const lastSavedRef = useRef<string>(dailyLog?.diary ?? '')
  const onUpdateRef = useRef(onUpdate)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)

  onUpdateRef.current = onUpdate

  const form = useForm<DiaryFormValues>({
    resolver: zodResolver(diaryFormSchema),
    values: {
      diary: dailyLog?.diary || '',
    },
  })

  const diaryValue = form.watch('diary')

  useEffect(() => {
    lastSavedRef.current = dailyLog?.diary ?? ''
  }, [dailyLog?.diary])

  useEffect(() => {
    const value = diaryValue ?? ''
    if (value === lastSavedRef.current) return

    const timeoutId = setTimeout(async () => {
      const normalized = value.trim() ? value : null
      setIsSaving(true)
      try {
        await onUpdateRef.current({ diary: normalized })
        lastSavedRef.current = normalized ?? ''
        setSavedMessage(true)
      } finally {
        setIsSaving(false)
      }
    }, AUTO_SAVE_DELAY_MS)

    return () => clearTimeout(timeoutId)
  }, [diaryValue])

  useEffect(() => {
    if (!savedMessage) return
    const id = setTimeout(() => setSavedMessage(false), 2000)
    return () => clearTimeout(id)
  }, [savedMessage])

  return (
    <Card className="border-stone-200/60 dark:border-stone-700/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">日記</CardTitle>
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
                name="diary"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MarkdownTextarea
                        {...field}
                        ref={field.ref}
                        placeholder="今日の日記を書いてください..."
                        className="min-h-[200px] overflow-hidden focus-visible:ring-0 focus-visible:ring-offset-0"
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
