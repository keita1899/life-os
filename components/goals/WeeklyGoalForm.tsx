'use client'

import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { getWeekStartDate } from '@/lib/calendar/utils'
import { formatDateISO } from '@/lib/date/formats'
import { cn } from '@/lib/utils'
import type { WeeklyGoal } from '@/lib/types/weekly-goal'

const weeklyGoalFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
})

type WeeklyGoalFormValues = z.infer<typeof weeklyGoalFormSchema>

interface WeeklyGoalFormProps {
  currentDate: Date
  weeklyGoals: WeeklyGoal[]
  weekStartDay?: number
}

export function WeeklyGoalForm({
  currentDate,
  weeklyGoals,
  weekStartDay = 0,
}: WeeklyGoalFormProps) {
  const weekStartDate = useMemo(
    () => getWeekStartDate(currentDate, weekStartDay),
    [currentDate, weekStartDay],
  )
  const weekStartDateString = useMemo(() => {
    const date = new Date(weekStartDate)
    date.setHours(0, 0, 0, 0)
    return formatDateISO(date)
  }, [weekStartDate])

  const currentWeeklyGoal = useMemo(
    () =>
      weeklyGoals.find((goal) => goal.weekStartDate === weekStartDateString),
    [weeklyGoals, weekStartDateString],
  )

  const {
    createWeeklyGoal,
    updateWeeklyGoal,
    deleteWeeklyGoal,
    toggleWeeklyGoalAchievement,
  } = useGoals(currentDate.getFullYear())

  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<WeeklyGoalFormValues>({
    resolver: zodResolver(weeklyGoalFormSchema),
    values: currentWeeklyGoal
      ? {
          title: currentWeeklyGoal.title,
        }
      : {
          title: '',
        },
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsEditing(false), 0)
    return () => clearTimeout(timeoutId)
  }, [currentWeeklyGoal])

  const handleSubmit = async (data: WeeklyGoalFormValues) => {
    const trimmedValue = data.title.trim()
    if (!trimmedValue) {
      if (currentWeeklyGoal) {
        await handleDelete()
      }
      return
    }

    if (currentWeeklyGoal) {
      if (trimmedValue === currentWeeklyGoal.title) {
        setIsEditing(false)
        return
      }
    }

    try {
      if (currentWeeklyGoal) {
        await updateWeeklyGoal(currentWeeklyGoal.id, {
          title: trimmedValue,
        })
      } else {
        await createWeeklyGoal({
          title: trimmedValue,
          weekStartDate: weekStartDateString,
        })
      }
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save weekly goal:', err)
    }
  }

  const handleDelete = async () => {
    if (!currentWeeklyGoal) return

    try {
      await deleteWeeklyGoal(currentWeeklyGoal.id)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to delete weekly goal:', err)
    }
  }

  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    form.reset(
      currentWeeklyGoal
        ? { title: currentWeeklyGoal.title }
        : { title: '' },
    )
    setIsEditing(false)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <Label
          htmlFor="weekly-goal-title"
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap min-w-[80px]"
        >
          週間目標
        </Label>
        {isEditing || !currentWeeklyGoal ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex items-center gap-2 flex-1"
            >
              <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      id="weekly-goal-title"
                      ref={field.ref}
                      autoFocus={isEditing && !!currentWeeklyGoal}
                      placeholder="週間目標を入力"
                      disabled={form.formState.isSubmitting}
                      className="bg-white text-stone-900 border-stone-200 dark:bg-stone-50 dark:text-stone-900 dark:border-stone-800"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleCancel()
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              size="default"
            >
              保存
            </Button>
            {currentWeeklyGoal && (
              <Button
                type="button"
                onClick={handleCancel}
                disabled={form.formState.isSubmitting}
                variant="outline"
                size="default"
              >
                キャンセル
              </Button>
            )}
            </form>
          </Form>
        ) : (
          <div className="group relative flex h-10 flex-1 items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-900 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-100 dark:hover:bg-purple-900/50">
            <button
              type="button"
              onClick={async () => {
                if (!currentWeeklyGoal) return
                try {
                  await toggleWeeklyGoalAchievement(currentWeeklyGoal.id)
                } catch (err) {
                  console.error('週間目標の達成状態の更新に失敗しました:', err)
                }
              }}
              aria-label={currentWeeklyGoal.achieved ? '未達成にする' : '達成にする'}
              aria-pressed={currentWeeklyGoal.achieved}
              className="focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 focus:outline-none"
            >
              {currentWeeklyGoal.achieved ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-stone-400" />
              )}
            </button>
            <div
              role="button"
              tabIndex={0}
              onDoubleClick={handleDoubleClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleDoubleClick()
                }
              }}
              className="flex-1 cursor-pointer"
            >
              <span
                className={cn(
                  'truncate',
                  currentWeeklyGoal.achieved &&
                    'line-through text-stone-500 dark:text-stone-400',
                )}
              >
                {currentWeeklyGoal.title}
              </span>
            </div>
          <div className="absolute right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="h-6 w-6 text-purple-600 hover:bg-purple-200 dark:text-purple-400 dark:hover:bg-purple-800"
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">削除</span>
            </Button>
          </div>
          </div>
        )}
      </div>
    </div>
  )
}
