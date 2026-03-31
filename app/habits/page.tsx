'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import { CreateButton } from '@/components/ui/create-button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  HabitDialog,
  HabitHeatmap,
  useHabits,
  useHabitCompletionsByDate,
  getCompletionsByDate,
  createCompletion,
  deleteCompletion,
  useHabitHeatmapView,
  type Habit,
  type CreateHabitInput,
} from '@/features/habits'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { SWR_KEYS } from '@/lib/swr-keys'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HabitsPage() {
  const {
    habits,
    isLoading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
  } = useHabits()
  const {
    isDialogOpen,
    editingItem: editingHabit,
    handleEdit: handleEditHabit,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<Habit>()
  const deleteConfirm = useDeleteConfirm<Habit>()
  const { operationError, setOperationError, execute } = useAsyncOperation()
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
  const { mutate: globalMutate } = useSWRConfig()
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

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

  const handleCreateHabit = async (input: CreateHabitInput) => {
    const result = await execute(
      () => createHabit(input),
      '習慣の作成に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleUpdateHabit = async (input: CreateHabitInput) => {
    if (!editingHabit) return

    const result = await execute(
      () =>
        updateHabit(editingHabit.id, {
          name: input.name,
          scheduledTime: input.scheduledTime,
          frequencyType: input.frequencyType,
          frequencyDays: input.frequencyDays,
          frequencyDayOfMonth: input.frequencyDayOfMonth,
        }),
      '習慣の更新に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleDeleteHabit = async () => {
    const habit = deleteConfirm.deletingItem
    if (!habit) return

    const result = await execute(
      () => deleteHabit(habit.id),
      '習慣の削除に失敗しました',
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleToggleToday = async (habit: Habit) => {
    const completed = completedHabitIdsToday.has(habit.id)
    await execute(
      async () => {
        if (completed) {
          await deleteHabitCompletion(habit.id, todayStr)
        } else {
          await createHabitCompletion(habit.id, todayStr)
        }
      },
      '習慣の完了状態の更新に失敗しました',
    )
  }

  const handleRenameHabit = async (habit: Habit, name: string) => {
    await execute(
      () => updateHabit(habit.id, { name }),
      '習慣名の更新に失敗しました',
    )
  }

  const handleToggleDate = async (habit: Habit, dateStr: string) => {
    await execute(
      async () => {
        const completions = await getCompletionsByDate(dateStr)
        const isCompleted = completions.some((c) => c.habitId === habit.id)
        if (isCompleted) {
          await deleteCompletion(habit.id, dateStr)
        } else {
          await createCompletion(habit.id, dateStr)
        }
        const [y, m] = dateStr.split('-').map(Number)
        await globalMutate(SWR_KEYS.habitCompletionsByMonth(habit.id, y!, m!))
        await globalMutate(SWR_KEYS.habitCompletionsByDate(dateStr))
      },
      '習慣の完了状態の更新に失敗しました',
    )
  }

  return (
    <>
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">習慣</h1>
          <div className="flex items-center gap-3">
            <CreateButton
              label="習慣を作成"
              onClick={handleCreateClick}
            />
          </div>
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
              <CreateButton
                label="習慣を作成"
                variant="outline"
                className="mt-4"
                onClick={handleCreateClick}
              />
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
            <CardContent className="p-0">
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
                onDelete={deleteConfirm.handleDeleteClick}
                onRename={handleRenameHabit}
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
          open={!!deleteConfirm.deletingItem}
          message={`「${deleteConfirm.deletingItem?.name ?? ''}」を削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteHabit}
          onCancel={deleteConfirm.handleDeleteCancel}
        />
      </div>
    </>
  )
}
