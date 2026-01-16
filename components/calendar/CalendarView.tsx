'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { useGoals } from '@/hooks/useGoals'
import { useEvents } from '@/hooks/useEvents'
import {
  formatMonthYear,
  formatWeekRange,
  navigateMonth,
  navigateWeek,
  getMonthlyGoalsForDate,
} from '@/lib/calendar/utils'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'

type ViewMode = 'month' | 'week'

interface CalendarViewProps {
  initialDate?: Date
}

export function CalendarView({ initialDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  const currentYear = currentDate.getFullYear()
  const { monthlyGoals, weeklyGoals, isLoading: isLoadingGoals } = useGoals(currentYear)
  const { events, isLoading: isLoadingEvents } = useEvents()

  const isLoading = isLoadingGoals || isLoadingEvents

  const currentMonthGoals = useMemo(
    () => getMonthlyGoalsForDate(monthlyGoals, currentDate),
    [monthlyGoals, currentDate],
  )

  const handlePrev = () => {
    setCurrentDate((prev) =>
      viewMode === 'month'
        ? navigateMonth(prev, 'prev')
        : navigateWeek(prev, 'prev'),
    )
  }

  const handleNext = () => {
    setCurrentDate((prev) =>
      viewMode === 'month'
        ? navigateMonth(prev, 'next')
        : navigateWeek(prev, 'next'),
    )
  }

  const displayTitle =
    viewMode === 'month'
      ? formatMonthYear(currentDate)
      : formatWeekRange(currentDate)

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{displayTitle}</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={viewMode}
                onValueChange={(value) => setViewMode(value as ViewMode)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">月表示</SelectItem>
                  <SelectItem value="week">週表示</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">
                  {viewMode === 'month' ? '前の月' : '前の週'}
                </span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">
                  {viewMode === 'month' ? '次の月' : '次の週'}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {viewMode === 'month' && currentMonthGoals.length > 0 && (
            <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-950/50">
              <h3 className="mb-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                今月の目標
              </h3>
              <div className="space-y-2">
                {currentMonthGoals.map((goal) => (
                  <MonthlyGoalItem key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="flex h-96 items-center justify-center text-muted-foreground">
              読み込み中...
            </div>
          ) : viewMode === 'month' ? (
            <MonthView
              currentDate={currentDate}
              monthlyGoals={monthlyGoals}
              events={events}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              monthlyGoals={monthlyGoals}
              weeklyGoals={weeklyGoals}
              events={events}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface MonthlyGoalItemProps {
  goal: MonthlyGoal
}

function MonthlyGoalItem({ goal }: MonthlyGoalItemProps) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-white p-2 dark:bg-stone-900">
      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 dark:bg-blue-400" />
      <div className="flex-1">
        <div className="text-sm text-stone-900 dark:text-stone-100">
          {goal.title}
        </div>
        {goal.targetDate && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            達成予定日: {new Date(goal.targetDate).toLocaleDateString('ja-JP')}
          </div>
        )}
      </div>
    </div>
  )
}
