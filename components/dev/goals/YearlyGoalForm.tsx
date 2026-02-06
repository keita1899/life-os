'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useFormSubmitShortcut } from '@/hooks/useFormSubmitShortcut'
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
import { ChecklistEditor } from '@/components/goals/ChecklistEditor'
import type {
  DevYearlyGoal,
  CreateDevYearlyGoalInput,
} from '@/lib/types/dev-yearly-goal'
import type { ChecklistItem } from '@/lib/types/checklist-item'

const yearlyGoalFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  year: z
    .number()
    .int()
    .min(1900, '年は1900〜2100の間で指定してください')
    .max(2100, '年は1900〜2100の間で指定してください'),
})

type YearlyGoalFormValues = z.infer<typeof yearlyGoalFormSchema>

interface YearlyGoalFormProps {
  onSubmit: (data: CreateDevYearlyGoalInput) => Promise<void>
  onCancel?: () => void
  initialData?: DevYearlyGoal
  submitLabel?: string
  selectedYear?: number
}

export const YearlyGoalForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
  selectedYear,
}: YearlyGoalFormProps) => {
  const isEditMode = !!initialData
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    initialData?.checklist ?? [],
  )

  const form = useForm<YearlyGoalFormValues>({
    resolver: zodResolver(yearlyGoalFormSchema),
    values: initialData
      ? {
          title: initialData.title,
          year: initialData.year,
        }
      : {
          title: '',
          year: selectedYear ?? new Date().getFullYear(),
        },
  })

  const handleSubmit = useCallback(async (data: YearlyGoalFormValues) => {
    await onSubmit({
      title: data.title,
      year: data.year ?? selectedYear ?? new Date().getFullYear(),
      checklist: checklist.length > 0 ? checklist : undefined,
    })
    if (!isEditMode) {
      form.reset({
        title: '',
        year: selectedYear ?? new Date().getFullYear(),
      })
      setChecklist([])
    }
  }, [onSubmit, selectedYear, checklist, isEditMode, form])

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input placeholder="目標のタイトルを入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>年</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="年を入力"
                  {...field}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === '' ? undefined : Number(v))
                  }}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ChecklistEditor items={checklist} onChange={setChecklist} />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? `${submitLabel.startsWith('作成') ? '作成中...' : '更新中...'}`
              : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
