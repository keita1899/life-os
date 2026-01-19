'use client'

import { useMemo } from 'react'
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
  FormDescription,
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
import type { UserSettings, UpdateUserSettingsInput } from '@/lib/types/user-settings'
import { formatDateForInput } from '@/lib/date/formats'

const userSettingsFormSchema = z.object({
  birthday: z.string().optional(),
  defaultCalendarView: z.enum(['month', 'week']),
  weekStartDay: z.enum(['0', '1']),
  morningReviewTime: z.string().optional(),
  eveningReviewTime: z.string().optional(),
})

type UserSettingsFormValues = z.infer<typeof userSettingsFormSchema>

interface UserSettingsFormProps {
  onSubmit: (data: UpdateUserSettingsInput) => Promise<void>
  initialData?: UserSettings
  isSubmitting?: boolean
}

export const UserSettingsForm = ({
  onSubmit,
  initialData,
  isSubmitting = false,
}: UserSettingsFormProps) => {
  const formValues = useMemo<UserSettingsFormValues>(() => {
    const weekStartDayValue = initialData?.weekStartDay ?? 0
    return {
      birthday: initialData?.birthday ? formatDateForInput(initialData.birthday) : '',
      defaultCalendarView: initialData?.defaultCalendarView || 'month',
      weekStartDay: (String(weekStartDayValue) === '0' ? '0' : '1') as '0' | '1',
      morningReviewTime: initialData?.morningReviewTime || '',
      eveningReviewTime: initialData?.eveningReviewTime || '',
    }
  }, [initialData])

  const form = useForm<UserSettingsFormValues>({
    resolver: zodResolver(userSettingsFormSchema),
    values: formValues,
  })

  const handleSubmit = async (data: UserSettingsFormValues) => {
    await onSubmit({
      birthday: data.birthday || null,
      defaultCalendarView: data.defaultCalendarView,
      weekStartDay: Number(data.weekStartDay),
      morningReviewTime: data.morningReviewTime || null,
      eveningReviewTime: data.eveningReviewTime || null,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>誕生日</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                やりたいことリストで年齢を計算するために使用します
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultCalendarView"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カレンダーのデフォルト表示</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="month">月表示</SelectItem>
                  <SelectItem value="week">週表示</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                カレンダーページを開いたときの初期表示を設定します
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weekStartDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>週の開始日</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">日曜日</SelectItem>
                  <SelectItem value="1">月曜日</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                週表示の開始曜日を設定します
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="morningReviewTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>朝の確認時間</FormLabel>
              <FormControl>
                <Input type="time" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                朝の目標・タスク・予定の確認時間を設定します（例: 07:00）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eveningReviewTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>夜の確認時間</FormLabel>
              <FormControl>
                <Input type="time" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                夜の振り返り・日記の確認時間を設定します（例: 21:00）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
            {isSubmitting || form.formState.isSubmitting ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
