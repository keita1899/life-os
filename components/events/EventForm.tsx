'use client'

import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useFormSubmitShortcut } from '@/hooks/useFormSubmitShortcut'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AutoResizeTextarea } from '@/components/ui/textarea-autosize'
import { getTodayDateString } from '@/lib/date/formats'
import { EVENT_CATEGORIES } from '@/lib/events/constants'
import { getEventFormValues } from '@/lib/events/form'
import type {
  Event,
  CreateEventInput,
  EventCategory,
  RecurrenceRule,
} from '@/lib/types/event'

const EVENT_CATEGORY_VALUES = EVENT_CATEGORIES.filter(
  (cat): cat is { value: NonNullable<EventCategory>; label: string; emoji: string } =>
    cat.value !== null,
).map((cat) => cat.value) as [
  NonNullable<EventCategory>,
  ...NonNullable<EventCategory>[],
]

const RECURRENCE_OPTIONS: { value: '' | RecurrenceRule; label: string }[] = [
  { value: '', label: 'なし' },
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
]

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1)
const LAST_DAY_OF_MONTH = 0

const eventFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean(),
  category: z.enum(EVENT_CATEGORY_VALUES).nullable().optional(),
  description: z.string().optional(),
  recurrenceRule: z
    .enum(['daily', 'weekly', 'monthly'])
    .nullable()
    .optional(),
  recurrenceDaysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  recurrenceDayOfMonth: z.number().min(0).max(31).nullable().optional(),
  recurrenceEndDate: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
  onSubmit: (data: CreateEventInput) => Promise<void>
  onCancel?: () => void
  initialData?: Event
  defaultTitle?: string
  defaultStartDate?: string
  submitLabel?: string
}

export const EventForm = ({
  onSubmit,
  onCancel,
  initialData,
  defaultTitle,
  defaultStartDate,
  submitLabel = '作成',
}: EventFormProps) => {
  const baseValues = getEventFormValues(initialData) as EventFormValues
  const values =
    !initialData && (defaultTitle || defaultStartDate)
      ? {
          ...baseValues,
          ...(defaultTitle && { title: defaultTitle }),
          ...(defaultStartDate && { startDate: defaultStartDate }),
        }
      : baseValues

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    values,
  })

  const allDay = form.watch('allDay')
  const recurrenceRule = form.watch('recurrenceRule')
  const startDate = form.watch('startDate')

  useEffect(() => {
    if (!startDate) return
    const date = parseISO(startDate)
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
  }, [recurrenceRule, startDate, form])

  const toggleRecurrenceDayOfWeek = (day: number) => {
    const current = form.getValues('recurrenceDaysOfWeek') ?? []
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b)
    form.setValue('recurrenceDaysOfWeek', next)
  }

  const handleSubmit = useCallback(async (data: EventFormValues) => {
    const startDate =
      data.startDate && data.startDate !== '' ? data.startDate : getTodayDateString()

    const startDatetime = data.allDay
      ? `${startDate}T00:00:00`
      : `${startDate}T${data.startTime || '00:00'}:00`
    const endDateForEnd = data.endDate?.trim() || startDate
    const endDatetime =
      data.endDate?.trim() || (data.endTime?.trim() && !data.allDay)
        ? data.allDay
          ? `${endDateForEnd}T23:59:59`
          : `${endDateForEnd}T${data.endTime?.trim() || '00:00'}:00`
        : null

    const recurrenceRule: RecurrenceRule | null =
      data.recurrenceRule ?? null
    const recurrenceEndDate =
      data.recurrenceEndDate && data.recurrenceEndDate.trim() !== ''
        ? data.recurrenceEndDate
        : null

    const recurrenceDaysOfWeek =
      recurrenceRule === 'weekly'
        ? (data.recurrenceDaysOfWeek?.length
            ? data.recurrenceDaysOfWeek
            : null)
        : null
    const recurrenceDayOfMonth =
      recurrenceRule === 'monthly' ? (data.recurrenceDayOfMonth ?? null) : null

    try {
      await onSubmit({
        title: data.title,
        startDatetime,
        endDatetime,
        allDay: data.allDay,
        category: data.category || null,
        description: data.description || null,
        recurrenceRule,
        recurrenceDaysOfWeek,
        recurrenceDayOfMonth,
        recurrenceEndDate,
      })
    } catch (error) {
      throw error
    }
  }, [onSubmit])

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
                <Input placeholder="予定のタイトルを入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カテゴリー</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(
                    value === 'none' ? null : (value as EventCategory),
                  )
                }
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EVENT_CATEGORIES.map((category) => (
                    <SelectItem
                      key={category.value || 'none'}
                      value={category.value || 'none'}
                    >
                      {category.emoji ? `${category.emoji} ${category.label}` : category.label}
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
          name="allDay"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-stone-700"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="!mt-0 cursor-pointer">終日</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>開始日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!allDay && (
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>開始時刻</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>終了日（任意）</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!allDay && (
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>終了時刻（任意）</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

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
                        (form.watch('recurrenceDaysOfWeek') ?? []).indexOf(i) >=
                        0
                      return (
                        <Button
                          key={i}
                          type="button"
                          variant={selected ? 'default' : 'outline'}
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
                          variant={field.value === day ? 'default' : 'outline'}
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
                        field.value === LAST_DAY_OF_MONTH ? 'default' : 'outline'
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

        <FormField
          control={form.control}
          name="recurrenceEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>繰り返し終了日（任意）</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => {
            const { ref, ...fieldProps } = field
            return (
              <FormItem>
                <FormLabel>説明</FormLabel>
                <FormControl>
                  <AutoResizeTextarea
                    ref={field.ref}
                    placeholder="説明を入力（任意）"
                    {...fieldProps}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

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
