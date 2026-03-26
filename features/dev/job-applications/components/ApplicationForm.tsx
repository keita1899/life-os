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
  JobApplication,
  CreateJobApplicationInput,
  ApplicationStatus,
} from '../types/job-application'
import { APPLICATION_STATUS_LABELS } from '../types/job-application'

const applicationFormSchema = z.object({
  companyName: z.string().min(1, '企業名は必須です'),
  status: z
    .enum([
      'interested',
      'applied',
      'document_screening',
      'interview',
      'offer',
      'accepted',
      'rejected',
      'withdrawn',
    ])
    .optional(),
  url: z.string().optional(),
  appliedDate: z.string().optional(),
  notes: z.string().optional(),
})

type ApplicationFormValues = z.infer<typeof applicationFormSchema>

interface ApplicationFormProps {
  onSubmit: (data: CreateJobApplicationInput) => Promise<void>
  onCancel?: () => void
  initialData?: JobApplication
  submitLabel?: string
}

export function ApplicationForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: ApplicationFormProps): ReactElement {
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      companyName: '',
      status: 'interested',
      url: '',
      appliedDate: '',
      notes: '',
    },
  })

  const statusValue = form.watch('status')

  useEffect(() => {
    if (initialData) {
      form.setValue('companyName', initialData.companyName)
      form.setValue('status', initialData.status ?? 'interested')
      form.setValue('url', initialData.url || '')
      form.setValue('appliedDate', initialData.appliedDate || '')
      form.setValue('notes', initialData.notes || '')
    } else {
      form.reset({
        companyName: '',
        status: 'interested',
        url: '',
        appliedDate: '',
        notes: '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  const handleSubmit = useCallback(
    async (data: ApplicationFormValues): Promise<void> => {
      const companyName = data.companyName || ''
      if (!companyName.trim()) {
        form.setError('companyName', { message: '企業名は必須です' })
        return
      }

      await onSubmit({
        companyName,
        status: (data.status as ApplicationStatus) || 'interested',
        url: data.url || null,
        appliedDate: data.appliedDate || null,
        notes: data.notes || null,
      })
    },
    [onSubmit, form],
  )

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>企業名 *</FormLabel>
                <FormControl>
                  <Input placeholder="企業名を入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ステータス</FormLabel>
                <Select
                  key={`${initialData?.id || 'new'}-${statusValue}`}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(
                      Object.entries(APPLICATION_STATUS_LABELS) as [
                        ApplicationStatus,
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
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>求人URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://..."
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
            name="appliedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>応募日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ''} />
                </FormControl>
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
