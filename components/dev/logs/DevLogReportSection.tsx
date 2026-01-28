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
import type { DevDailyLog, UpdateDevDailyLogInput } from '@/lib/types/dev-daily-log'

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    values: {
      report: devDailyLog?.report || '',
    },
  })

  const reportValue = form.watch('report')

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const minHeight = 200
    textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`
  }, [reportValue, devDailyLog])

  const handleSubmit = async (data: ReportFormValues) => {
    const normalizedReport = data.report?.trim() || null
    await onUpdate({ report: normalizedReport })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">日報</CardTitle>
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
                name="report"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        ref={(e) => {
                          field.ref(e)
                          textareaRef.current = e
                        }}
                        placeholder="今日の日報を書いてください..."
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
