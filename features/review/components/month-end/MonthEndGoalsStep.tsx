'use client'

import { useMemo, useState, useCallback } from 'react'
import { useGoals } from '@/features/goals'
import { useDevGoals } from '@/features/dev/goals'
import { getMonthlyGoalsForDate } from '@/features/calendar'
import { LogGoalsSection } from '@/features/logs'
import { DevLogGoalsSection } from '@/features/dev/logs'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { useUserSettings } from '@/features/settings'
import {
  MonthlyGoalDialog,
  createMonthlyGoal,
} from '@/features/goals'
import {
  MonthlyGoalDialog as DevMonthlyGoalDialog,
  createDevMonthlyGoal,
} from '@/features/dev/goals'
import type { ReviewMode } from '../../types/review-completion'
import type { CreateMonthlyGoalInput } from '@/features/goals'
import type { CreateDevMonthlyGoalInput } from '@/features/dev/goals'

interface MonthEndGoalsStepProps {
  nextMonth: Date
  mode: ReviewMode
  execute: <T>(
    fn: () => Promise<T>,
    errorMessage: string,
  ) => Promise<T | undefined>
}

export function MonthEndGoalsStep({
  nextMonth,
  mode,
  execute,
}: MonthEndGoalsStepProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const nextYear = nextMonth.getFullYear()
  const nextMonthNum = nextMonth.getMonth() + 1
  const { userSettings } = useUserSettings()
  const weekStartDay = userSettings?.weekStartDay ?? 1

  const { monthlyGoals, refreshGoals } = useGoals(nextYear)
  const {
    monthlyGoals: devMonthlyGoals,
    refreshGoals: devRefreshGoals,
  } = useDevGoals(nextYear)

  const lifeNextMonthly = useMemo(
    () => getMonthlyGoalsForDate(monthlyGoals, nextMonth),
    [monthlyGoals, nextMonth],
  )
  const devNextMonthly = useMemo(
    () =>
      devMonthlyGoals.filter(
        (g) => g.year === nextYear && g.month === nextMonthNum,
      ),
    [devMonthlyGoals, nextYear, nextMonthNum],
  )

  const handleCreateLife = useCallback(
    async (input: CreateMonthlyGoalInput) => {
      const result = await execute(
        async () => {
          await createMonthlyGoal({
            ...input,
            year: input.year ?? nextYear,
            month: nextMonthNum,
          })
          await refreshGoals()
          return true
        },
        '月間目標の作成に失敗しました',
      )
      if (result !== undefined) setIsDialogOpen(false)
    },
    [nextYear, nextMonthNum, refreshGoals, execute],
  )

  const handleCreateDev = useCallback(
    async (input: CreateDevMonthlyGoalInput) => {
      const result = await execute(
        async () => {
          await createDevMonthlyGoal({
            ...input,
            year: input.year ?? nextYear,
            month: nextMonthNum,
          })
          await devRefreshGoals()
          return true
        },
        '月間目標の作成に失敗しました',
      )
      if (result !== undefined) setIsDialogOpen(false)
    },
    [nextYear, nextMonthNum, devRefreshGoals, execute],
  )

  if (mode === 'development') {
    if (devNextMonthly.length === 0) {
      return (
        <div className="space-y-5">
          <EmptyState message="来月の目標を立てましょう" />
          <Button onClick={() => setIsDialogOpen(true)}>
            来月の目標を作成
          </Button>
          <DevMonthlyGoalDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={handleCreateDev}
            selectedYear={nextYear}
            selectedMonth={nextMonthNum}
          />
        </div>
      )
    }
    return (
      <div className="space-y-5">
        <DevLogGoalsSection
          yearlyGoals={[]}
          monthlyGoals={devNextMonthly}
          weeklyGoals={[]}
          currentDate={nextMonth}
          weekStartDay={weekStartDay}
        />
      </div>
    )
  }

  if (lifeNextMonthly.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState message="来月の目標を立てましょう" />
        <Button onClick={() => setIsDialogOpen(true)}>
          来月の目標を作成
        </Button>
        <MonthlyGoalDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateLife}
          selectedYear={nextYear}
          selectedMonth={nextMonthNum}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <LogGoalsSection
        yearlyGoals={[]}
        monthlyGoals={lifeNextMonthly}
        weeklyGoals={[]}
        currentDate={nextMonth}
        weekStartDay={weekStartDay}
      />
    </div>
  )
}
