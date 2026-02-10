'use client'

import { useMemo } from 'react'
import { CalendarView } from '@/components/calendar/CalendarView'
import { useGoals } from '@/features/goals'
import { Card } from '@/components/ui/card'
import { Target } from 'lucide-react'
import { LifeHomeCreateButtons } from '@/components/floating/LifeHomeCreateButtons'

export default function Home() {
  const currentYear = new Date().getFullYear()
  const { yearlyGoals, isLoading } = useGoals(currentYear)

  const yearlyGoal = useMemo(() => {
    return yearlyGoals.length > 0 ? yearlyGoals[0] : null
  }, [yearlyGoals])

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 px-4 md:py-12 md:px-8 lg:px-16">
        <div className="flex flex-col gap-6">
          {!isLoading && yearlyGoal && (
            <Card className="border-stone-200 p-4 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    {currentYear}年の年間目標
                  </div>
                  <div className="text-lg font-semibold">
                    {yearlyGoal.title}
                  </div>
                </div>
              </div>
            </Card>
          )}
          <div className="flex-1">
            <CalendarView />
          </div>
        </div>
      </div>
      <LifeHomeCreateButtons />
    </>
  )
}
