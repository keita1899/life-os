'use client'

import { useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useFormSubmitShortcut } from '@/hooks/useFormSubmitShortcut'
import { formatSubmitLabelWithShortcut } from '@/lib/utils/shortcut'
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
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserSettings, UpdateUserSettingsInput } from '../types/user-settings'
import { formatDateForInput } from '@/lib/date/formats'

const userSettingsFormSchema = z.object({
  birthday: z.string().optional(),
  defaultCalendarView: z.enum(['month', 'week']),
  weekStartDay: z.enum(['0', '1']),
  morningReviewTime: z.string().optional(),
  eveningReviewTime: z.string().optional(),
  weekStartReviewTime: z.string().optional(),
  weekEndReviewTime: z.string().optional(),
  barcelonaIcalUrl: z.string().url().optional().or(z.literal('')),
  defaultHabitView: z.enum(['month', 'week']),
  notifyEvents: z.boolean(),
  notifyTasks: z.boolean(),
  notifyHabits: z.boolean(),
  notifyMinutesBefore: z.enum(['0', '5', '10', '15', '30']),
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
    const weekStartDayValue = initialData?.weekStartDay ?? 1
    return {
      birthday: initialData?.birthday ? formatDateForInput(initialData.birthday) : '',
      defaultCalendarView: initialData?.defaultCalendarView || 'week',
      weekStartDay: (String(weekStartDayValue) === '0' ? '0' : '1') as '0' | '1',
      morningReviewTime: initialData?.morningReviewTime || '',
      eveningReviewTime: initialData?.eveningReviewTime || '',
      weekStartReviewTime: initialData?.weekStartReviewTime || '',
      weekEndReviewTime: initialData?.weekEndReviewTime || '',
      barcelonaIcalUrl: initialData?.barcelonaIcalUrl || '',
      defaultHabitView: initialData?.defaultHabitView || 'week',
      notifyEvents: initialData?.notifyEvents ?? true,
      notifyTasks: initialData?.notifyTasks ?? true,
      notifyHabits: initialData?.notifyHabits ?? true,
      notifyMinutesBefore: String(initialData?.notifyMinutesBefore ?? 5) as '0' | '5' | '10' | '15' | '30',
    }
  }, [initialData])

  const form = useForm<UserSettingsFormValues>({
    resolver: zodResolver(userSettingsFormSchema),
    values: formValues,
  })

  const handleSubmit = useCallback(async (data: UserSettingsFormValues) => {
    await onSubmit({
      birthday: data.birthday || null,
      defaultCalendarView: data.defaultCalendarView,
      weekStartDay: Number(data.weekStartDay),
      morningReviewTime: data.morningReviewTime || null,
      eveningReviewTime: data.eveningReviewTime || null,
      weekStartReviewTime: data.weekStartReviewTime || null,
      weekEndReviewTime: data.weekEndReviewTime || null,
      barcelonaIcalUrl: data.barcelonaIcalUrl || null,
      defaultHabitView: data.defaultHabitView,
      notifyEvents: data.notifyEvents,
      notifyTasks: data.notifyTasks,
      notifyHabits: data.notifyHabits,
      notifyMinutesBefore: Number(data.notifyMinutesBefore),
    })
  }, [onSubmit])

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            基本
          </h2>
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
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            表示
          </h2>
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
            name="defaultHabitView"
            render={({ field }) => (
            <FormItem>
              <FormLabel>習慣のデフォルト表示</FormLabel>
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
                習慣ページを開いたときの初期表示を設定します
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
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            レビュー・確認
          </h2>
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

        <FormField
          control={form.control}
          name="weekStartReviewTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>週初の確認時間</FormLabel>
              <FormControl>
                <Input type="time" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                週の始まりの確認ウィザードを表示する時間（未設定なら週開始日は終日対象）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weekEndReviewTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>週末の確認時間</FormLabel>
              <FormControl>
                <Input type="time" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                週の締めくくりの確認ウィザードを表示する時間（未設定なら週終了日は終日対象）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            外部連携
          </h2>
          <FormField
            control={form.control}
            name="barcelonaIcalUrl"
            render={({ field }) => (
            <FormItem>
              <FormLabel>FCバルセロナ iCal URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/calendar.ics"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                FCバルセロナの試合スケジュールをカレンダーに同期するためのiCal URLを設定します
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            通知
          </h2>
          <FormField
            control={form.control}
            name="notifyEvents"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <FormLabel className="cursor-pointer">予定の通知</FormLabel>
                  <FormDescription>
                    予定の開始前に通知を送ります
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notifyTasks"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <FormLabel className="cursor-pointer">タスクの通知</FormLabel>
                  <FormDescription>
                    タスクの実行時間前に通知を送ります
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notifyHabits"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <FormLabel className="cursor-pointer">習慣の通知</FormLabel>
                  <FormDescription>
                    習慣の実行時間前に通知を送ります
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notifyMinutesBefore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>通知タイミング</FormLabel>
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
                    <SelectItem value="0">開始時刻</SelectItem>
                    <SelectItem value="5">5 分前</SelectItem>
                    <SelectItem value="10">10 分前</SelectItem>
                    <SelectItem value="15">15 分前</SelectItem>
                    <SelectItem value="30">30 分前</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  予定・タスク・習慣の開始前の何分前に通知するかを設定します
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
            {isSubmitting || form.formState.isSubmitting ? '保存中...' : formatSubmitLabelWithShortcut('保存')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
