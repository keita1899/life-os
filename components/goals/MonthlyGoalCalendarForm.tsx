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
import { Trash2 } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { getYear, getMonth } from 'date-fns'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'

const monthlyGoalFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
})

type MonthlyGoalFormValues = z.infer<typeof monthlyGoalFormSchema>

interface MonthlyGoalFormProps {
  currentDate: Date
  monthlyGoals: MonthlyGoal[]
}

export function MonthlyGoalCalendarForm({
  currentDate,
  monthlyGoals,
}: MonthlyGoalFormProps) {
  const year = useMemo(() => getYear(currentDate), [currentDate])
  const month = useMemo(() => getMonth(currentDate) + 1, [currentDate])

  const currentMonthlyGoal = useMemo(
    () =>
      monthlyGoals.find((goal) => goal.year === year && goal.month === month),
    [monthlyGoals, year, month],
  )

  const { createMonthlyGoal, updateMonthlyGoal, deleteMonthlyGoal } =
    useGoals(year)

  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<MonthlyGoalFormValues>({
    resolver: zodResolver(monthlyGoalFormSchema),
    values: currentMonthlyGoal
      ? {
          title: currentMonthlyGoal.title,
        }
      : {
          title: '',
        },
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsEditing(false), 0)
    return () => clearTimeout(timeoutId)
  }, [currentMonthlyGoal])

  const handleSubmit = async (data: MonthlyGoalFormValues) => {
    const trimmedValue = data.title.trim()
    if (!trimmedValue) {
      if (currentMonthlyGoal) {
        await handleDelete()
      }
      return
    }

    if (currentMonthlyGoal) {
      if (trimmedValue === currentMonthlyGoal.title) {
        setIsEditing(false)
        return
      }
    }

    try {
      if (currentMonthlyGoal) {
        await updateMonthlyGoal(currentMonthlyGoal.id, {
          title: trimmedValue,
          year,
          month,
        })
      } else {
        await createMonthlyGoal({
          title: trimmedValue,
          year,
          month,
        })
      }
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save monthly goal:', err)
    }
  }

  const handleDelete = async () => {
    if (!currentMonthlyGoal) return

    try {
      await deleteMonthlyGoal(currentMonthlyGoal.id)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to delete monthly goal:', err)
    }
  }

  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    form.reset(
      currentMonthlyGoal
        ? { title: currentMonthlyGoal.title }
        : { title: '' },
    )
    setIsEditing(false)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <Label
          htmlFor="monthly-goal-title"
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap min-w-[80px]"
        >
          月間目標
        </Label>
        {isEditing || !currentMonthlyGoal ? (
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
                        id="monthly-goal-title"
                        ref={field.ref}
                        autoFocus={isEditing && !!currentMonthlyGoal}
                        placeholder="月間目標を入力"
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
              {currentMonthlyGoal && (
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
            role="button"
            tabIndex={0}
            onDoubleClick={handleDoubleClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleDoubleClick()
              }
            }}
            className="group relative flex h-10 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-900 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100 dark:hover:bg-blue-900/50"
          >
            <span className="flex-1 truncate">{currentMonthlyGoal.title}</span>
            <div className="absolute right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="h-6 w-6 text-blue-600 hover:bg-blue-200 dark:text-blue-400 dark:hover:bg-blue-800"
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
