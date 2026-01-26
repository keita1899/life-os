'use client'

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
import type {
  MonthlyGoal,
  CreateMonthlyGoalInput,
} from '@/lib/types/monthly-goal'

const monthlyGoalFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  year: z
    .number()
    .int('年は整数で入力してください')
    .min(1900, '年は1900〜2100の間で指定してください')
    .max(2100, '年は1900〜2100の間で指定してください'),
  month: z
    .number()
    .int('月は整数で入力してください')
    .min(1, '月は1〜12の間で指定してください')
    .max(12, '月は1〜12の間で指定してください'),
})

type MonthlyGoalFormValues = z.infer<typeof monthlyGoalFormSchema>

interface MonthlyGoalFormProps {
  onSubmit: (data: CreateMonthlyGoalInput) => Promise<void>
  onCancel?: () => void
  initialData?: MonthlyGoal
  submitLabel?: string
  selectedYear?: number
}

export const MonthlyGoalForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
  selectedYear,
}: MonthlyGoalFormProps) => {
  const isEditMode = !!initialData

  const form = useForm<MonthlyGoalFormValues>({
    resolver: zodResolver(monthlyGoalFormSchema),
    values: initialData
      ? {
          title: initialData.title,
          year: initialData.year,
          month: initialData.month,
        }
      : {
          title: '',
          year: selectedYear ?? new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        },
  })

  const handleSubmit = async (data: MonthlyGoalFormValues) => {
    await onSubmit({
      title: data.title,
      year: data.year ?? selectedYear ?? new Date().getFullYear(),
      month: data.month,
    })
    if (!isEditMode) {
      form.reset({
        title: '',
        year: selectedYear ?? new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      })
    }
  }

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

        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>月</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="月を入力"
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

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? `${submitLabel === '作成' ? '作成中...' : '更新中...'}`
              : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
