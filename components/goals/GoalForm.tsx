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
import type { CreateGoalInput, Goal } from '@/lib/types/goal'

const goalFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  targetDate: z.string().optional(),
  periodType: z.enum(['yearly', 'monthly']).optional(),
})

type GoalFormValues = z.infer<typeof goalFormSchema>

interface GoalFormProps {
  onSubmit: (data: CreateGoalInput) => Promise<void>
  onCancel?: () => void
  initialData?: Goal
  submitLabel?: string
}

export const GoalForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: GoalFormProps) => {
  const isEditMode = !!initialData

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      targetDate: initialData?.targetDate ?? '',
      periodType: initialData?.periodType || 'yearly',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        targetDate: initialData.targetDate ?? '',
        periodType: initialData.periodType,
      })
    } else {
      form.reset({
        title: '',
        targetDate: '',
        periodType: 'yearly',
      })
    }
  }, [initialData, form])

  const handleSubmit = async (data: GoalFormValues) => {
    await onSubmit(data)
    if (!isEditMode) {
      form.reset()
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
          name="targetDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>達成予定日</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="periodType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>期間タイプ</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="期間タイプを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yearly">年間</SelectItem>
                  <SelectItem value="monthly">月間</SelectItem>
                </SelectContent>
              </Select>
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
