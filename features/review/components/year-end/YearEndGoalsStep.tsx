'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useGoals, YearlyGoalDialog } from '@/features/goals'
import { useDevGoals, YearlyGoalDialog as DevYearlyGoalDialog } from '@/features/dev/goals'
import { LogGoalsSection } from '@/features/logs'
import { DevLogGoalsSection } from '@/features/dev/logs'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { useUserSettings } from '@/features/settings'
import type { ReviewMode } from '../../types/review-completion'
import type { CreateYearlyGoalInput } from '@/features/goals'
import type { CreateDevYearlyGoalInput } from '@/features/dev/goals'

interface YearEndGoalsStepProps {
  nextYear: Date
  mode: ReviewMode
}

export function YearEndGoalsStep({ nextYear, mode }: YearEndGoalsStepProps) {
  const { userSettings } = useUserSettings()
  const weekStartDay = userSettings?.weekStartDay ?? 1
  const nextYearNum = nextYear.getFullYear()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { yearlyGoals, createYearlyGoal, refreshGoals } = useGoals(nextYearNum)
  const {
    yearlyGoals: devYearlyGoals,
    createYearlyGoal: createDevYearlyGoal,
    refreshGoals: devRefreshGoals,
  } = useDevGoals(nextYearNum)

  const handleCreateLife = useCallback(
    async (input: CreateYearlyGoalInput) => {
      await createYearlyGoal({
        ...input,
        year: nextYearNum,
      })
      await refreshGoals()
      setIsDialogOpen(false)
    },
    [nextYearNum, createYearlyGoal, refreshGoals],
  )

  const handleCreateDev = useCallback(
    async (input: CreateDevYearlyGoalInput) => {
      await createDevYearlyGoal({
        ...input,
        year: nextYearNum,
      })
      await devRefreshGoals()
      setIsDialogOpen(false)
    },
    [nextYearNum, createDevYearlyGoal, devRefreshGoals],
  )

  if (mode === 'development') {
    if (devYearlyGoals.length === 0) {
      return (
        <div className="space-y-5">
          <EmptyState message="来年の目標を立てましょう" />
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dev/goals">目標ページへ</Link>
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              来年の目標を作成
            </Button>
          </div>
          <DevYearlyGoalDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={handleCreateDev}
            selectedYear={nextYearNum}
          />
        </div>
      )
    }
    return (
      <div className="space-y-5">
        <DevLogGoalsSection
          yearlyGoals={devYearlyGoals}
          monthlyGoals={[]}
          weeklyGoals={[]}
          currentDate={nextYear}
          weekStartDay={weekStartDay}
        />
      </div>
    )
  }

  if (yearlyGoals.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState message="来年の目標を立てましょう" />
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/goals">目標ページへ</Link>
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            来年の目標を作成
          </Button>
        </div>
        <YearlyGoalDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateLife}
          selectedYear={nextYearNum}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <LogGoalsSection
        yearlyGoals={yearlyGoals}
        monthlyGoals={[]}
        weeklyGoals={[]}
        currentDate={nextYear}
        weekStartDay={weekStartDay}
      />
    </div>
  )
}
