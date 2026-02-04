'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitDialog } from '@/components/habits/HabitDialog'
import { HabitHeatmap } from '@/components/habits/HabitHeatmap'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useHabits } from '@/hooks/useHabits'
import { useHabitCompletionsByDate } from '@/hooks/useHabitCompletions'
import { getCompletionsByDate } from '@/lib/habits'
import { useHabitHeatmapView } from '@/hooks/useHabitHeatmapView'
import { useMode } from '@/lib/contexts/ModeContext'
import type { Habit, CreateHabitInput } from '@/lib/types/habit'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HabitsPage() {
  const { mode } = useMode()
  const {
    habits,
    isLoading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
  } = useHabits()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined)
  const [deletingHabit, setDeletingHabit] = useState<Habit | undefined>(undefined)
  const [operationError, setOperationError] = useState<string | null>(null)
  const {
    currentDate: heatmapDate,
    viewMode,
    setViewMode,
    weekStartDay,
    handlePrev,
    handleNext,
    displayTitle,
    year: heatmapYear,
    month: heatmapMonth,
  } = useHabitHeatmapView()
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const {
    completions: todayCompletions,
    createCompletion: createHabitCompletion,
    deleteCompletion: deleteHabitCompletion,
  } = useHabitCompletionsByDate(todayStr)

  const completedHabitIdsToday = useMemo(
    () => new Set(todayCompletions.map((c) => c.habitId)),
    [todayCompletions],
  )

  const sortedHabits = useMemo(() => {
    const normalizeTime = (t: string | null): string => {
      if (!t?.trim()) return '99:99'
      const parts = t.trim().split(':')
      const h = (parts[0] ?? '0').padStart(2, '0')
      const m = (parts[1] ?? '0').padStart(2, '0')
      return `${h}:${m}`
    }
    return [...habits].sort((a, b) => {
      const ta = normalizeTime(a.scheduledTime)
      const tb = normalizeTime(b.scheduledTime)
      return ta.localeCompare(tb)
    })
  }, [habits])

  if (mode !== 'life') {
    return null
  }

  const handleCreateHabit = async (input: CreateHabitInput) => {
    try {
      setOperationError(null)
      await createHabit(input)
      setIsDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '習慣の作成に失敗しました',
      )
      throw err
    }
  }

  const handleUpdateHabit = async (input: CreateHabitInput) => {
    if (!editingHabit) return

    try {
      setOperationError(null)
      await updateHabit(editingHabit.id, {
        name: input.name,
        scheduledTime: input.scheduledTime,
        frequencyType: input.frequencyType,
        frequencyDays: input.frequencyDays,
        frequencyDayOfMonth: input.frequencyDayOfMonth,
      })
      setIsDialogOpen(false)
      setEditingHabit(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '習慣の更新に失敗しました',
      )
      throw err
    }
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingHabit(undefined)
    }
  }

  const handleDeleteClick = (habit: Habit) => {
    setDeletingHabit(habit)
  }

  const handleDeleteHabit = async () => {
    if (!deletingHabit) return

    try {
      setOperationError(null)
      await deleteHabit(deletingHabit.id)
      setDeletingHabit(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '習慣の削除に失敗しました',
      )
    }
  }

  const handleOpenCreate = () => {
    setEditingHabit(undefined)
    setIsDialogOpen(true)
  }

  const handleToggleToday = async (habit: Habit) => {
    const completed = completedHabitIdsToday.has(habit.id)
    try {
      setOperationError(null)
      if (completed) {
        await deleteHabitCompletion(habit.id, todayStr)
      } else {
        await createHabitCompletion(habit.id, todayStr)
      }
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '習慣の完了状態の更新に失敗しました',
      )
    }
  }

  const handleToggleDate = async (habit: Habit, dateStr: string) => {
    try {
      setOperationError(null)
      const completions = await getCompletionsByDate(dateStr)
      const isCompleted = completions.some((c) => c.habitId === habit.id)
      
      if (isCompleted) {
        await deleteHabitCompletion(habit.id, dateStr)
      } else {
        await createHabitCompletion(habit.id, dateStr)
      }
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '習慣の完了状態の更新に失敗しました',
      )
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">習慣</h1>
          <Button onClick={handleOpenCreate}>習慣を追加</Button>
        </div>

        <ErrorMessage
          message={operationError || error || ''}
          onDismiss={operationError ? () => setOperationError(null) : undefined}
        />

        {isLoading ? (
          <Loading />
        ) : sortedHabits.length === 0 ? (
          <div className="text-center">
            <EmptyState message="習慣がありません">
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleOpenCreate}
              >
                習慣を追加
              </Button>
            </EmptyState>
          </div>
        ) : (
          <Card className="border-stone-200/60 dark:border-stone-700/40">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">実行記録</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-md border border-stone-200 dark:border-stone-800">
                    <Button
                      variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-8 rounded-r-none border-0"
                      onClick={() => setViewMode('month')}
                    >
                      <span className="flex items-center gap-2">
                        月
                        <span className="text-xs text-muted-foreground">M</span>
                      </span>
                    </Button>
                    <Button
                      variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-8 rounded-l-none border-0 border-l border-stone-200 dark:border-stone-800"
                      onClick={() => setViewMode('week')}
                    >
                      <span className="flex items-center gap-2">
                        週
                        <span className="text-xs text-muted-foreground">W</span>
                      </span>
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">
                      {viewMode === 'month' ? '前月' : '前週'}
                    </span>
                  </Button>
                  <span className="w-[11rem] shrink-0 text-center text-sm font-medium tabular-nums">
                    {displayTitle}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">
                      {viewMode === 'month' ? '翌月' : '翌週'}
                    </span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <HabitHeatmap
                habits={sortedHabits}
                viewMode={viewMode}
                focusDate={heatmapDate}
                weekStartDay={weekStartDay}
                year={heatmapYear}
                month={heatmapMonth}
                completedHabitIdsToday={completedHabitIdsToday}
                onToggleToday={handleToggleToday}
                onToggleDate={handleToggleDate}
                onEdit={handleEditHabit}
                onDelete={handleDeleteClick}
              />
            </CardContent>
          </Card>
        )}

        <HabitDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
          habit={editingHabit}
        />

        <DeleteConfirmDialog
          open={!!deletingHabit}
          message={`「${deletingHabit?.name}」を削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteHabit}
          onCancel={() => setDeletingHabit(undefined)}
        />
      </div>
    </MainLayout>
  )
}
