'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { HabitDialog } from '@/components/habits/HabitDialog'
import { HabitMonthCompletions } from '@/components/habits/HabitMonthCompletions'
import { HabitStreakLabel } from '@/components/habits/HabitStreakLabel'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useHabits } from '@/hooks/useHabits'
import { useMode } from '@/lib/contexts/ModeContext'
import {
  formatHabitFrequency,
  formatHabitScheduledTime,
} from '@/lib/habits'
import type { Habit, CreateHabitInput } from '@/lib/types/habit'

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

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

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

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
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
          <div className="space-y-4">
            {sortedHabits.map((habit) => (
              <Card key={habit.id} className="group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {formatHabitFrequency(habit)}
                    </Badge>
                    {habit.scheduledTime && (
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatHabitScheduledTime(habit.scheduledTime)}
                      </span>
                    )}
                    <h2 className="text-lg font-semibold truncate">
                      {habit.name}
                    </h2>
                    <HabitStreakLabel
                      habit={habit}
                      year={currentYear}
                      month={currentMonth}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">メニューを開く</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditHabit(habit)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(habit)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium text-muted-foreground">
                    今月の実行記録
                  </div>
                  <div className="mt-2">
                    <HabitMonthCompletions
                      habit={habit}
                      year={currentYear}
                      month={currentMonth}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
