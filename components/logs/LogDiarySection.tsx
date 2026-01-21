'use client'

import { useEffect, useRef } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { DailyLog, UpdateDailyLogInput } from '@/lib/types/daily-log'

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const form = useForm<DiaryFormValues>({
    resolver: zodResolver(diaryFormSchema),
    values: {
      diary: dailyLog?.diary || '',
    },
  })

  const diaryValue = form.watch('diary')

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const minHeight = 200
    textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`
  }, [diaryValue, dailyLog])

  const handleSubmit = async (data: DiaryFormValues) => {
    const normalizedDiary = data.diary?.trim() || null
    await onUpdate({ diary: normalizedDiary })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">日記</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingLog ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="diary"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        ref={(e) => {
                          field.ref(e)
                          textareaRef.current = e
                        }}
                        placeholder="今日の日記を書いてください..."
                        className="min-h-[200px] resize-none overflow-hidden"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!form.formState.isDirty || form.formState.isSubmitting}
                  size="sm"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    '保存'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
