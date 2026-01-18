'use client'

import { useState, useEffect } from 'react'
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
import { MonthlyGoalCalendarForm } from '@/components/goals/MonthlyGoalCalendarForm'
import { useGoals } from '@/hooks/useGoals'
import { useEvents } from '@/hooks/useEvents'
import { useUserSettings } from '@/hooks/useUserSettings'
import {
  formatMonthYear,
  formatWeekRange,
  navigateMonth,
  navigateWeek,
} from '@/lib/calendar/utils'

type ViewMode = 'month' | 'week'

interface CalendarViewProps {
  initialDate?: Date
}

export function CalendarView({ initialDate }: CalendarViewProps) {
  const { userSettings, isLoading: isLoadingSettings } = useUserSettings()
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())
  const [viewMode, setViewMode] = useState<ViewMode>(
    userSettings?.defaultCalendarView || 'month'
  )

  const currentYear = currentDate.getFullYear()
  const {
    monthlyGoals,
    weeklyGoals,
    isLoading: isLoadingGoals,
  } = useGoals(currentYear)
  const { events, isLoading: isLoadingEvents } = useEvents()

  const isLoading = isLoadingGoals || isLoadingEvents || isLoadingSettings

  const weekStartDay = userSettings?.weekStartDay ?? 1

  useEffect(() => {
    if (userSettings?.defaultCalendarView) {
      setViewMode(userSettings.defaultCalendarView)
    }
  }, [userSettings?.defaultCalendarView])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      if (isInputFocused) {
        return
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setViewMode('month')
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        setViewMode('week')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
      : formatWeekRange(currentDate, weekStartDay)

  return (
    <div className="w-full space-y-4">
      <Card className="border-border shadow-none">
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
                  <SelectItem value="month">
                    <span className="flex items-center justify-between w-full">
                      <span>月</span>
                      <span className="ml-4 text-xs text-muted-foreground">
                        M
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="week">
                    <span className="flex items-center justify-between w-full">
                      <span>週</span>
                      <span className="ml-4 text-xs text-muted-foreground">
                        W
                      </span>
                    </span>
                  </SelectItem>
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
          {viewMode === 'month' && (
            <MonthlyGoalCalendarForm
              currentDate={currentDate}
              monthlyGoals={monthlyGoals}
            />
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
              weekStartDay={weekStartDay}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              monthlyGoals={monthlyGoals}
              weeklyGoals={weeklyGoals}
              events={events}
              weekStartDay={weekStartDay}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
