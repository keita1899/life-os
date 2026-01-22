'use client'

import { useMemo } from 'react'
import { useMode } from '@/lib/contexts/ModeContext'
import { CalendarView } from '@/components/calendar/CalendarView'
import { DevCalendarView } from '@/components/calendar/DevCalendarView'
import { MainLayout } from '@/components/layout/MainLayout'
import { useGoals } from '@/hooks/useGoals'
import { useDevGoals } from '@/hooks/useDevGoals'
import { Card } from '@/components/ui/card'
import { Target } from 'lucide-react'
import { formatDateDisplay } from '@/lib/date/formats'

export default function Home() {
  const { mode } = useMode()
  const currentYear = new Date().getFullYear()
  const { yearlyGoals, isLoading } = useGoals(currentYear)
  const {
    yearlyGoals: devYearlyGoals,
    isLoading: isDevLoading,
  } = useDevGoals(currentYear)

  const yearlyGoal = useMemo(() => {
    return yearlyGoals.length > 0 ? yearlyGoals[0] : null
  }, [yearlyGoals])

  const devYearlyGoal = useMemo(() => {
    return devYearlyGoals.length > 0 ? devYearlyGoals[0] : null
  }, [devYearlyGoals])

  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl py-8 px-4 md:py-12 md:px-8 lg:px-16">
        {mode === 'life' && (
          <div className="flex flex-col gap-6">
            {!isLoading && yearlyGoal && (
              <Card className="border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
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
                    {yearlyGoal.targetDate && (
                      <div className="text-sm text-muted-foreground">
                        目標日: {formatDateDisplay(yearlyGoal.targetDate)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
            <div className="flex-1">
              <CalendarView />
            </div>
          </div>
        )}
        {mode === 'development' && (
          <div className="flex flex-col gap-6">
            {!isDevLoading && devYearlyGoal && (
              <Card className="border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
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
                    {devYearlyGoal.targetDate && (
                      <div className="text-sm text-muted-foreground">
                        目標日: {formatDateDisplay(devYearlyGoal.targetDate)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
            <div className="flex-1">
              <DevCalendarView />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
