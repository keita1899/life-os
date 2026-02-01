'use client'

import { useState, useMemo } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitDialog } from '@/components/habits/HabitDialog'
import { HabitHeatmap } from '@/components/habits/HabitHeatmap'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useHabits } from '@/hooks/useHabits'
import { useHabitCompletionsByDate } from '@/hooks/useHabitCompletions'
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
  const [heatmapDate, setHeatmapDate] = useState(() => new Date())

  const now = new Date()
  const heatmapYear = heatmapDate.getFullYear()
  const heatmapMonth = heatmapDate.getMonth() + 1
  const todayStr = format(now, 'yyyy-MM-dd')

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
          <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
            <p className="text-muted-foreground">習慣がありません</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleOpenCreate}
            >
              習慣を追加
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">実行記録</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setHeatmapDate((d) => subMonths(d, 1))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">前月</span>
                  </Button>
                  <span className="min-w-[7rem] text-center text-sm font-medium tabular-nums">
                    {heatmapYear}年{heatmapMonth}月
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setHeatmapDate((d) => addMonths(d, 1))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">翌月</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <HabitHeatmap
                habits={sortedHabits}
                year={heatmapYear}
                month={heatmapMonth}
                completedHabitIdsToday={completedHabitIdsToday}
                onToggleToday={handleToggleToday}
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
