'use client'

import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { CalendarViewBase } from './CalendarViewBase'
import { MonthlyGoalCalendarForm } from '@/components/dev/goals/MonthlyGoalCalendarForm'
import { WeeklyGoalForm } from '@/components/dev/goals/WeeklyGoalForm'
import { useDevGoals } from '@/hooks/useDevGoals'
import { useCalendarView } from '@/hooks/useCalendarView'

interface DevCalendarViewProps {
  initialDate?: Date
}

export function DevCalendarView({ initialDate }: DevCalendarViewProps) {
  const {
    currentDate,
    viewMode,
    setViewMode,
    weekStartDay,
    isLoadingSettings,
    handlePrev,
    handleNext,
    displayTitle,
  } = useCalendarView({ initialDate })

  const currentYear = currentDate.getFullYear()
  const {
    monthlyGoals,
    weeklyGoals,
    isLoading: isLoadingGoals,
  } = useDevGoals(currentYear)

  const isLoading = isLoadingGoals || isLoadingSettings

  return (
    <CalendarViewBase
      displayTitle={displayTitle}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onPrev={handlePrev}
      onNext={handleNext}
      isLoading={isLoading}
    >
      {viewMode === 'month' && (
        <MonthlyGoalCalendarForm
          currentDate={currentDate}
          monthlyGoals={monthlyGoals}
        />
      )}
      {viewMode === 'week' && (
        <WeeklyGoalForm
          currentDate={currentDate}
          weeklyGoals={weeklyGoals}
          weekStartDay={weekStartDay}
        />
      )}
      {viewMode === 'month' ? (
        <MonthView
          currentDate={currentDate}
          monthlyGoals={monthlyGoals}
          events={[]}
          tasks={[]}
          weekStartDay={weekStartDay}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          monthlyGoals={monthlyGoals}
          weeklyGoals={weeklyGoals}
          events={[]}
          tasks={[]}
          weekStartDay={weekStartDay}
        />
      )}
    </CalendarViewBase>
  )
}
