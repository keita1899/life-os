'use client'

import { useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { MonthlyGoal, CreateMonthlyGoalInput } from '@/lib/types/monthly-goal'

const monthlyGoalFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  targetDate: z.string().optional(),
  year: z.number().int().min(1900).max(2100, '年は1900〜2100の間で指定してください'),
  month: z.number().int().min(1).max(12, '月は1〜12の間で指定してください'),
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
    defaultValues: {
      title: initialData?.title || '',
      targetDate: initialData?.targetDate ?? '',
      year: initialData?.year ?? selectedYear ?? new Date().getFullYear(),
      month: initialData?.month ?? new Date().getMonth() + 1,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        targetDate: initialData.targetDate ?? '',
        year: initialData.year,
        month: initialData.month,
      })
    } else {
      form.reset({
        title: '',
        targetDate: '',
        year: selectedYear ?? new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      })
    }
  }, [initialData, form, selectedYear])

  const handleSubmit = async (data: MonthlyGoalFormValues) => {
    await onSubmit({
      title: data.title,
      targetDate: data.targetDate || null,
      year: data.year ?? selectedYear ?? new Date().getFullYear(),
      month: data.month,
    })
    if (!isEditMode) {
      form.reset()
    }
  }

  const months = [
    { value: 1, label: '1月' },
    { value: 2, label: '2月' },
    { value: 3, label: '3月' },
    { value: 4, label: '4月' },
    { value: 5, label: '5月' },
    { value: 6, label: '6月' },
    { value: 7, label: '7月' },
    { value: 8, label: '8月' },
    { value: 9, label: '9月' },
    { value: 10, label: '10月' },
    { value: 11, label: '11月' },
    { value: 12, label: '12月' },
  ]

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
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="月を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
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
          name="targetDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>期限</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
