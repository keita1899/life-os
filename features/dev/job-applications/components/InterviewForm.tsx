'use client'

import type { ReactElement } from 'react'
import { useEffect, useCallback } from 'react'
import { useFormSubmitShortcut } from '@/hooks/useFormSubmitShortcut'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  JobInterview,
  CreateJobInterviewInput,
  InterviewType,
  InterviewResult,
} from '../types/job-interview'
import {
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_RESULT_LABELS,
} from '../types/job-interview'

const interviewFormSchema = z.object({
  round: z.coerce.number().int().min(1, '面接回数は1以上です'),
  interviewType: z
    .enum(['casual', 'interview', 'technical', 'final', 'other'])
    .optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  result: z
    .enum(['pending', 'passed', 'failed', 'cancelled', ''])
    .optional(),
})

type InterviewFormValues = z.infer<typeof interviewFormSchema>

interface InterviewFormProps {
  onSubmit: (data: CreateJobInterviewInput) => Promise<void>
  onCancel?: () => void
  initialData?: JobInterview
  submitLabel?: string
  applicationId: number
  defaultRound?: number
}

export function InterviewForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
  applicationId,
  defaultRound = 1,
}: InterviewFormProps): ReactElement {
  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      round: defaultRound,
      interviewType: 'interview',
      scheduledDate: '',
      scheduledTime: '',
      location: '',
      notes: '',
      result: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.setValue('round', initialData.round)
      form.setValue(
        'interviewType',
        (initialData.interviewType as InterviewType) ?? 'interview',
      )
      form.setValue('scheduledDate', initialData.scheduledDate || '')
      form.setValue('scheduledTime', initialData.scheduledTime || '')
      form.setValue('location', initialData.location || '')
      form.setValue('notes', initialData.notes || '')
      form.setValue('result', initialData.result || '')
    } else {
      form.reset({
        round: defaultRound,
        interviewType: 'interview',
        scheduledDate: '',
        scheduledTime: '',
        location: '',
        notes: '',
        result: '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, defaultRound])

  const handleSubmit = useCallback(
    async (data: InterviewFormValues): Promise<void> => {
      await onSubmit({
        applicationId,
        round: data.round,
        interviewType: (data.interviewType as InterviewType) || 'interview',
        scheduledDate: data.scheduledDate || null,
        scheduledTime: data.scheduledTime || null,
        location: data.location || null,
        notes: data.notes || null,
        result: (data.result as InterviewResult) || null,
      })
    },
    [onSubmit, applicationId],
  )

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="round"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>面接回数 *</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interviewType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>種別</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="種別を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        Object.entries(INTERVIEW_TYPE_LABELS) as [
                          InterviewType,
                          string,
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>面接日</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>面接時間</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>場所 / URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="場所またはURLを入力"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="result"
            render={({ field }) => (
              <FormItem>
                <FormLabel>結果</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="結果を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">未選択</SelectItem>
                    {(
                      Object.entries(INTERVIEW_RESULT_LABELS) as [
                        InterviewResult,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メモ</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="メモを入力"
                    rows={3}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          )}
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  )
}
