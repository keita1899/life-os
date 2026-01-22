'use client'

import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { CalendarViewBase } from './CalendarViewBase'
import { MonthlyGoalCalendarForm } from '@/components/goals/MonthlyGoalCalendarForm'
import { useGoals } from '@/hooks/useGoals'
import { useEvents } from '@/hooks/useEvents'
import { useTasks } from '@/hooks/useTasks'
import { useCalendarView } from '@/hooks/useCalendarView'

interface CalendarViewProps {
  initialDate?: Date
}

export function CalendarView({ initialDate }: CalendarViewProps) {
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
  } = useGoals(currentYear)
  const { events, isLoading: isLoadingEvents } = useEvents()
  const { tasks, isLoading: isLoadingTasks } = useTasks()

  const isLoading =
    isLoadingGoals || isLoadingEvents || isLoadingTasks || isLoadingSettings

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
      {viewMode === 'month' ? (
        <MonthView
          currentDate={currentDate}
          monthlyGoals={monthlyGoals}
          events={events}
          tasks={tasks}
          weekStartDay={weekStartDay}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          monthlyGoals={monthlyGoals}
          weeklyGoals={weeklyGoals}
          events={events}
          tasks={tasks}
          weekStartDay={weekStartDay}
        />
      )}
    </CalendarViewBase>
  )
}
