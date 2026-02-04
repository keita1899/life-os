'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { parseISO, getDay, getDate } from 'date-fns'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMode } from '@/lib/contexts/ModeContext'
import type { Task, CreateTaskInput } from '@/lib/types/task'
import type { RecurrenceRule } from '@/lib/types/event'
import {
  getTodayDateString,
  getTomorrowDateString,
  formatDateForInput,
} from '@/lib/date/formats'

const RECURRENCE_OPTIONS: { value: '' | RecurrenceRule; label: string }[] = [
  { value: '', label: 'なし' },
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
]

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1)
const LAST_DAY_OF_MONTH = 0

const taskFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  executionDate: z.string().optional(),
  recurrenceRule: z
    .enum(['daily', 'weekly', 'monthly'])
    .nullable()
    .optional(),
  recurrenceDaysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  recurrenceDayOfMonth: z.number().min(0).max(31).nullable().optional(),
  recurrenceEndDate: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void>
  onCancel?: () => void
  initialData?: Task
  submitLabel?: string
}

export const TaskForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: TaskFormProps) => {
  const { mode } = useMode()
  const showRecurrence = mode === 'life'
  const isEditMode = !!initialData

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    values: initialData
      ? {
          title: initialData.title,
          executionDate: formatDateForInput(initialData.executionDate),
          recurrenceRule: initialData.recurrenceRule,
          recurrenceDaysOfWeek: initialData.recurrenceDaysOfWeek ?? [],
          recurrenceDayOfMonth: initialData.recurrenceDayOfMonth,
          recurrenceEndDate: initialData.recurrenceEndDate ?? '',
        }
      : {
          title: '',
          executionDate: getTodayDateString(),
          recurrenceRule: null,
          recurrenceDaysOfWeek: [],
          recurrenceDayOfMonth: null,
          recurrenceEndDate: '',
        },
  })

  const executionDate = form.watch('executionDate')
  const recurrenceRule = form.watch('recurrenceRule')
  const [datePresetOverride, setDatePresetOverride] = useState<
    'none' | 'today' | 'tomorrow' | 'custom' | null
  >(null)

  useEffect(() => {
    if (!executionDate) return
    const date = parseISO(executionDate)
    if (recurrenceRule === 'weekly') {
      const current = form.getValues('recurrenceDaysOfWeek')
      if (!current?.length) {
        form.setValue('recurrenceDaysOfWeek', [getDay(date)])
      }
    }
    if (recurrenceRule === 'monthly') {
      const currentDom = form.getValues('recurrenceDayOfMonth')
      if (currentDom === null || currentDom === undefined) {
        form.setValue('recurrenceDayOfMonth', getDate(date))
      }
    }
  }, [recurrenceRule, executionDate, form])

  const toggleRecurrenceDayOfWeek = (day: number) => {
    const current = form.getValues('recurrenceDaysOfWeek') ?? []
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b)
    form.setValue('recurrenceDaysOfWeek', next)
  }

  const datePreset = useMemo(() => {
    if (datePresetOverride) return datePresetOverride
    if (!executionDate) return 'none'
    if (executionDate === getTodayDateString()) return 'today'
    if (executionDate === getTomorrowDateString()) return 'tomorrow'
    return 'custom'
  }, [executionDate, datePresetOverride])

  const handleDatePresetChange = (value: string) => {
    if (value === 'custom') {
      setDatePresetOverride('custom')
      return
    }
    setDatePresetOverride(null)
    const presetToDate: Record<string, string> = {
      none: '',
      today: getTodayDateString(),
      tomorrow: getTomorrowDateString(),
    }
    const date = presetToDate[value]
    if (date !== undefined) {
      form.setValue('executionDate', date)
    }
  }

  const handleSubmit = async (data: TaskFormValues) => {
    const recurrenceRule: RecurrenceRule | null = showRecurrence
      ? (data.recurrenceRule ?? null)
      : null
    const recurrenceEndDate =
      showRecurrence &&
      data.recurrenceEndDate &&
      data.recurrenceEndDate.trim() !== ''
        ? data.recurrenceEndDate
        : null
    const recurrenceDaysOfWeek =
      showRecurrence && recurrenceRule === 'weekly'
        ? data.recurrenceDaysOfWeek?.length
          ? data.recurrenceDaysOfWeek
          : null
        : null
    const recurrenceDayOfMonth =
      showRecurrence && recurrenceRule === 'monthly'
        ? (data.recurrenceDayOfMonth ?? null)
        : null

    await onSubmit({
      title: data.title,
      executionDate: data.executionDate || null,
      recurrenceRule,
      recurrenceDaysOfWeek,
      recurrenceDayOfMonth,
      recurrenceEndDate,
    })
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
                <Input placeholder="タスクのタイトルを入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="executionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>実行日</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={datePreset === 'today' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDatePresetChange('today')}
                    >
                      今日
                    </Button>
                    <Button
                      type="button"
                      variant={datePreset === 'tomorrow' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDatePresetChange('tomorrow')}
                    >
                      明日
                    </Button>
                    <Button
                      type="button"
                      variant={datePreset === 'none' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDatePresetChange('none')}
                    >
                      未定
                    </Button>
                    <Button
                      type="button"
                      variant={datePreset === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDatePresetChange('custom')}
                    >
                      日付を選択
                    </Button>
                  </div>
                  {datePreset === 'custom' && (
                    <Input type="date" {...field} value={field.value || ''} />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showRecurrence && (
          <>
            <FormField
              control={form.control}
              name="recurrenceRule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>繰り返し</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? null : value)
                    }
                    value={field.value ?? 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value || 'none'}
                          value={opt.value || 'none'}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {recurrenceRule === 'weekly' && (
              <FormField
                control={form.control}
                name="recurrenceDaysOfWeek"
                render={() => (
                  <FormItem>
                    <FormLabel>曜日</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAY_LABELS.map((label, i) => {
                          const selected =
                            (form.watch('recurrenceDaysOfWeek') ?? []).indexOf(
                              i,
                            ) >= 0
                          return (
                            <Button
                              key={i}
                              type="button"
                              variant={
                                selected ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => toggleRecurrenceDayOfWeek(i)}
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

            {recurrenceRule === 'monthly' && (
              <FormField
                control={form.control}
                name="recurrenceDayOfMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>日付</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="grid grid-cols-8 gap-2">
                          {DAYS_OF_MONTH.map((day) => (
                            <Button
                              key={day}
                              type="button"
                              variant={
                                field.value === day ? 'default' : 'outline'
                              }
                              size="sm"
                              className="min-w-0 px-2"
                              onClick={() => field.onChange(day)}
                            >
                              {day}
                            </Button>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant={
                            field.value === LAST_DAY_OF_MONTH
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => field.onChange(LAST_DAY_OF_MONTH)}
                        >
                          月末
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {recurrenceRule && (
              <FormField
                control={form.control}
                name="recurrenceEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>繰り返し終了日（任意）</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

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
