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
import type { UserSettings, UpdateUserSettingsInput, WeekdayThemes } from '../types/user-settings'
import { formatDateForInput } from '@/lib/date/formats'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

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
  weekdayTheme0: z.string().optional(),
  weekdayTheme1: z.string().optional(),
  weekdayTheme2: z.string().optional(),
  weekdayTheme3: z.string().optional(),
  weekdayTheme4: z.string().optional(),
  weekdayTheme5: z.string().optional(),
  weekdayTheme6: z.string().optional(),
})

type UserSettingsFormValues = z.infer<typeof userSettingsFormSchema>

interface UserSettingsFormProps {
  onSubmit: (data: UpdateUserSettingsInput) => Promise<void>
  initialData?: UserSettings
  isSubmitting?: boolean
  mode?: 'life' | 'dev'
}

function getThemesForMode(initialData: UserSettings | undefined, mode: 'life' | 'dev'): WeekdayThemes {
  if (!initialData) return {}
  return mode === 'life' ? initialData.lifeWeekdayThemes : initialData.devWeekdayThemes
}

export const UserSettingsForm = ({
  onSubmit,
  initialData,
  isSubmitting = false,
  mode = 'life',
}: UserSettingsFormProps) => {
  const formValues = useMemo<UserSettingsFormValues>(() => {
    const weekStartDayValue = initialData?.weekStartDay ?? 1
    const themes = getThemesForMode(initialData, mode)
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
      weekdayTheme0: themes['0'] || '',
      weekdayTheme1: themes['1'] || '',
      weekdayTheme2: themes['2'] || '',
      weekdayTheme3: themes['3'] || '',
      weekdayTheme4: themes['4'] || '',
      weekdayTheme5: themes['5'] || '',
      weekdayTheme6: themes['6'] || '',
    }
  }, [initialData, mode])

  const form = useForm<UserSettingsFormValues>({
    resolver: zodResolver(userSettingsFormSchema),
    values: formValues,
  })

  const handleSubmit = useCallback(async (data: UserSettingsFormValues) => {
    const themes: WeekdayThemes = {}
    for (let i = 0; i < 7; i++) {
      const value = data[`weekdayTheme${i}` as keyof UserSettingsFormValues] as string
      if (value) {
        themes[String(i)] = value
      }
    }

    const themeUpdate = mode === 'life'
      ? { lifeWeekdayThemes: themes }
      : { devWeekdayThemes: themes }

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
      ...themeUpdate,
    })
  }, [onSubmit, mode])

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

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            曜日テーマ
          </h2>
          <p className="text-[0.8rem] text-muted-foreground">
            各曜日にテーマを設定すると、カレンダーの曜日ヘッダーに表示されます
          </p>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const dayIndex = form.watch('weekStartDay') === '0' ? i : ((i + 1) % 7)
              return (
                <FormField
                  key={dayIndex}
                  control={form.control}
                  name={`weekdayTheme${dayIndex}` as keyof UserSettingsFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-center block text-xs">{WEEKDAY_LABELS[dayIndex]}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder=""
                          {...field}
                          value={(field.value as string) || ''}
                          className="text-center text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )
            })}
          </div>
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
