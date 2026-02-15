'use client'

import { Suspense, useMemo } from 'react'
import { DevCalendarView } from '@/features/calendar'
import { Loading } from '@/components/ui/loading'
import { useDevGoals } from '@/features/dev/goals'
import { Card } from '@/components/ui/card'
import { Target } from 'lucide-react'
import { DevHomeTaskCreateButton } from '@/features/dev/home'

export default function DevHome() {
  const currentYear = new Date().getFullYear()
  const {
    yearlyGoals: devYearlyGoals,
    isLoading: isDevLoading,
  } = useDevGoals(currentYear)

  const devYearlyGoal = useMemo(() => {
    return devYearlyGoals.length > 0 ? devYearlyGoals[0] : null
  }, [devYearlyGoals])

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 px-4 md:py-12 md:px-8 lg:px-16">
        <div className="flex flex-col gap-6">
          {!isDevLoading && devYearlyGoal && (
            <Card className="border-stone-200 bg-transparent p-4 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    {currentYear}年の年間目標
                  </div>
                  <div className="text-lg font-semibold">
                    {devYearlyGoal.title}
                  </div>
                </div>
              </div>
            </Card>
          )}
          <div className="flex-1">
            <Suspense fallback={<Loading />}>
              <DevCalendarView />
            </Suspense>
          </div>
          <DevHomeTaskCreateButton />
        </div>
      </div>
    </>
  )
}
