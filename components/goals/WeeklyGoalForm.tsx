'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
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
import { Trash2 } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { getWeekStartDate } from '@/lib/calendar/utils'
import type { WeeklyGoal } from '@/lib/types/weekly-goal'

const weeklyGoalFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
})

type WeeklyGoalFormValues = z.infer<typeof weeklyGoalFormSchema>

interface WeeklyGoalFormProps {
  currentDate: Date
  weeklyGoals: WeeklyGoal[]
}

export function WeeklyGoalForm({
  currentDate,
  weeklyGoals,
}: WeeklyGoalFormProps) {
  const weekStartDate = useMemo(
    () => getWeekStartDate(currentDate),
    [currentDate],
  )
  const weekStartDateString = useMemo(
    () => weekStartDate.toISOString().split('T')[0],
    [weekStartDate],
  )

  const currentWeeklyGoal = useMemo(
    () =>
      weeklyGoals.find((goal) => goal.weekStartDate === weekStartDateString),
    [weeklyGoals, weekStartDateString],
  )

  const { createWeeklyGoal, updateWeeklyGoal, deleteWeeklyGoal } = useGoals(
    currentDate.getFullYear(),
  )

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const form = useForm<WeeklyGoalFormValues>({
    resolver: zodResolver(weeklyGoalFormSchema),
    defaultValues: {
      title: currentWeeklyGoal?.title || '',
    },
  })

  useEffect(() => {
    if (currentWeeklyGoal) {
      form.reset({
        title: currentWeeklyGoal.title,
      })
      setIsEditing(false)
    } else {
      form.reset({
        title: '',
      })
      setIsEditing(false)
    }
  }, [currentWeeklyGoal])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

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
      form.reset({ title: '' })
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
    form.reset({
      title: currentWeeklyGoal?.title || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="mb-3 space-y-2">
      <Label className="text-sm font-medium text-stone-900 dark:text-stone-100">
        週間目標
      </Label>
      {isEditing || !currentWeeklyGoal ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex gap-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      ref={(e) => {
                        field.ref(e)
                        inputRef.current = e
                      }}
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
        <div
          onDoubleClick={handleDoubleClick}
          className="group relative flex h-10 w-full cursor-pointer items-center rounded-md bg-black px-3 py-2 text-sm font-bold text-white dark:bg-black dark:text-white"
        >
          {currentWeeklyGoal.title}
          <div className="absolute right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="h-6 w-6 text-white hover:bg-white/20"
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">削除</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
