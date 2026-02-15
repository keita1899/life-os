'use client'

import { useEffect, useCallback } from 'react'
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
import type { Habit, CreateHabitInput, HabitFrequencyType } from '../types/habit'

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

const habitFormSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  scheduledTime: z.string().optional(),
  frequencyType: z.enum(['daily', 'custom_days']),
  customDays: z.array(z.number().min(0).max(6)).optional(),
})

type HabitFormValues = z.infer<typeof habitFormSchema>

interface HabitFormProps {
  onSubmit: (data: CreateHabitInput) => Promise<void>
  onCancel?: () => void
  initialData?: Habit
  submitLabel?: string
}

function toFormValues(habit: Habit): HabitFormValues {
  let customDays: number[] = []
  let frequencyType: 'daily' | 'custom_days' = 'daily'
  if (habit.frequencyType === 'custom_days' && habit.frequencyDays) {
    customDays = habit.frequencyDays
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6)
    frequencyType = 'custom_days'
  } else if (habit.frequencyType === 'weekly' && habit.frequencyDays) {
    const day = parseInt(habit.frequencyDays.trim(), 10)
    if (!Number.isNaN(day) && day >= 0 && day <= 6) {
      customDays = [day]
      frequencyType = 'custom_days'
    }
  }
  return {
    name: habit.name,
    scheduledTime: habit.scheduledTime ?? '',
    frequencyType,
    customDays,
  }
}

export function HabitForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: HabitFormProps) {
  const isEditMode = !!initialData

  const defaultValues: HabitFormValues = {
    name: '',
    scheduledTime: '',
    frequencyType: 'daily',
    customDays: [],
  }

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(initialData ? toFormValues(initialData) : defaultValues)
  }, [initialData])

  const frequencyType = form.watch('frequencyType')

  const handleSubmit = useCallback(async (data: HabitFormValues) => {
    let frequencyDays: string | null = null
    if (
      data.frequencyType === 'custom_days' &&
      data.customDays &&
      data.customDays.length > 0
    ) {
      frequencyDays = [...data.customDays].sort((a, b) => a - b).join(',')
    }

    await onSubmit({
      name: data.name,
      scheduledTime: data.scheduledTime || null,
      frequencyType: data.frequencyType as HabitFrequencyType,
      frequencyDays,
      frequencyDayOfMonth: null,
    })
    if (!isEditMode) {
      form.reset()
    }
  }, [onSubmit, isEditMode, form])

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

  const toggleCustomDay = (day: number) => {
    const current = form.getValues('customDays') ?? []
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b)
    form.setValue('customDays', next)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="習慣の名前を入力" {...field} />
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
              <FormLabel>実行時間</FormLabel>
              <FormControl>
                <Input type="time" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frequencyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>頻度</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={field.value === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => field.onChange('daily')}
                  >
                    毎日
                  </Button>
                  <Button
                    type="button"
                    variant={
                      field.value === 'custom_days' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => field.onChange('custom_days')}
                  >
                    曜日を指定
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {frequencyType === 'custom_days' && (
          <FormField
            control={form.control}
            name="customDays"
            render={() => (
              <FormItem>
                <FormLabel>曜日</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {DAY_LABELS.map((label, i) => {
                      const selected =
                        (form.watch('customDays') ?? []).indexOf(i) >= 0
                      return (
                        <Button
                          key={i}
                          type="button"
                          variant={selected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleCustomDay(i)}
                        >
                          {label}
                        </Button>
                      )
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
