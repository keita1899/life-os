'use client'

import { useMemo, useState } from 'react'
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
import type { Task, CreateTaskInput } from '@/lib/types/task'
import {
  getTodayDateString,
  getTomorrowDateString,
  formatDateForInput,
} from '@/lib/date/formats'

const taskFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  executionDate: z.string().optional(),
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
  const isEditMode = !!initialData

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    values: initialData
      ? {
          title: initialData.title,
          executionDate: formatDateForInput(initialData.executionDate),
        }
      : {
          title: '',
          executionDate: getTodayDateString(),
        },
  })

  const executionDate = form.watch('executionDate')
  const [datePresetOverride, setDatePresetOverride] = useState<
    'none' | 'today' | 'tomorrow' | 'custom' | null
  >(null)

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
    await onSubmit({
      title: data.title,
      executionDate: data.executionDate || null,
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
              <div className="space-y-2">
                <Select
                  value={datePreset}
                  onValueChange={handleDatePresetChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">日付なし</SelectItem>
                    <SelectItem value="today">今日</SelectItem>
                    <SelectItem value="tomorrow">明日</SelectItem>
                    <SelectItem value="custom">日付を選択</SelectItem>
                  </SelectContent>
                </Select>
                {datePreset === 'custom' && (
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
                  </FormControl>
                )}
              </div>
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
