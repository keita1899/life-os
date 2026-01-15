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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type {
  Event,
  CreateEventInput,
  RecurrenceType,
  EventCategory,
} from '@/lib/types/event'

const EVENT_CATEGORIES: Array<{ value: EventCategory; label: string }> = [
  { value: null, label: 'カテゴリーなし' },
  { value: 'work', label: '仕事' },
  { value: 'life', label: '生活' },
  { value: 'housework', label: '家事' },
  { value: 'social', label: '交際' },
  { value: 'play', label: '遊び' },
  { value: 'hobby', label: '趣味' },
  { value: 'health', label: '健康' },
  { value: 'procedure', label: '手続き' },
  { value: 'birthday', label: '誕生日' },
  { value: 'anniversary', label: '記念日' },
]

const eventFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean(),
  recurrenceType: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']),
  recurrenceEndDate: z.string().optional(),
  recurrenceCount: z.string().optional(),
  recurrenceDaysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  category: z
    .enum([
      'work',
      'life',
      'housework',
      'social',
      'play',
      'hobby',
      'health',
      'procedure',
      'birthday',
      'anniversary',
    ])
    .nullable()
    .optional(),
  description: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
  onSubmit: (data: CreateEventInput) => Promise<void>
  onCancel?: () => void
  initialData?: Event
  submitLabel?: string
}

export const EventForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: EventFormProps) => {
  const isEditMode = !!initialData

  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateTimeForInput = (
    datetime: string,
    isAllDay: boolean,
  ): { date: string; time: string } => {
    const date = new Date(datetime)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    if (isAllDay) {
      return { date: dateStr, time: '' }
    }

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const timeStr = `${hours}:${minutes}`

    return { date: dateStr, time: timeStr }
  }

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      startDate: initialData
        ? formatDateTimeForInput(initialData.startDatetime, initialData.allDay)
            .date
        : '',
      startTime: initialData
        ? formatDateTimeForInput(initialData.startDatetime, initialData.allDay)
            .time
        : '',
      endDate: initialData?.endDatetime
        ? formatDateTimeForInput(initialData.endDatetime, initialData.allDay)
            .date
        : '',
      endTime: initialData?.endDatetime
        ? formatDateTimeForInput(initialData.endDatetime, initialData.allDay)
            .time
        : '',
      allDay: initialData?.allDay || false,
      recurrenceType: initialData?.recurrenceType || 'none',
      recurrenceEndDate: initialData?.recurrenceEndDate || '',
      recurrenceCount: initialData?.recurrenceCount?.toString() || '',
      recurrenceDaysOfWeek: initialData?.recurrenceDaysOfWeek || [],
      category: initialData?.category || null,
      description: initialData?.description || '',
    },
  })

  const allDay = form.watch('allDay')
  const recurrenceType = form.watch('recurrenceType')
  const recurrenceDaysOfWeek = form.watch('recurrenceDaysOfWeek') || []

  const handleSubmit = async (data: EventFormValues) => {
    const startDate =
      data.startDate && data.startDate !== '' ? data.startDate : getTodayDate()

    const startDatetime = data.allDay
      ? `${startDate}T00:00:00`
      : `${startDate}T${data.startTime || '00:00'}:00`
    const endDatetime =
      data.endDate && data.endDate !== ''
        ? data.allDay
          ? `${data.endDate}T23:59:59`
          : `${data.endDate}T${data.endTime || '00:00'}:00`
        : null

    try {
      await onSubmit({
        title: data.title,
        startDatetime,
        endDatetime,
        allDay: data.allDay,
        recurrenceType: data.recurrenceType as RecurrenceType,
        recurrenceEndDate:
          data.recurrenceEndDate && data.recurrenceEndDate !== ''
            ? data.recurrenceEndDate
            : null,
        recurrenceCount:
          data.recurrenceCount && data.recurrenceCount !== ''
            ? Number(data.recurrenceCount)
            : null,
        recurrenceDaysOfWeek:
          data.recurrenceType === 'weekly' &&
          data.recurrenceDaysOfWeek &&
          data.recurrenceDaysOfWeek.length > 0
            ? data.recurrenceDaysOfWeek
            : null,
        category: data.category || null,
        description: data.description || null,
      })
    } catch (error) {
      throw error
    }
  }

  const weekDays = [
    { value: 0, label: '日' },
    { value: 1, label: '月' },
    { value: 2, label: '火' },
    { value: 3, label: '水' },
    { value: 4, label: '木' },
    { value: 5, label: '金' },
    { value: 6, label: '土' },
  ]

  const toggleDayOfWeek = (day: number) => {
    const current = form.getValues('recurrenceDaysOfWeek') || []
    const newDays = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort()
    form.setValue('recurrenceDaysOfWeek', newDays)
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
                      {category.label}
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
          name="recurrenceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>繰り返し</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">繰り返さない</SelectItem>
                  <SelectItem value="daily">毎日</SelectItem>
                  <SelectItem value="weekly">毎週</SelectItem>
                  <SelectItem value="monthly">毎月</SelectItem>
                  <SelectItem value="yearly">毎年</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {recurrenceType === 'weekly' && (
          <FormField
            control={form.control}
            name="recurrenceDaysOfWeek"
            render={() => (
              <FormItem>
                <FormLabel>繰り返す曜日</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDayOfWeek(day.value)}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        recurrenceDaysOfWeek.includes(day.value)
                          ? 'bg-blue-600 text-white dark:bg-blue-500'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700',
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </FormItem>
            )}
          />
        )}

        {recurrenceType !== 'none' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="recurrenceEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>繰り返し終了日</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recurrenceCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>繰り返し回数</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="回数（任意）"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="説明を入力（任意）"
                  {...field}
                  rows={3}
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
