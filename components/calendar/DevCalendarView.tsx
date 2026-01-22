'use client'

import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { CalendarViewBase } from './CalendarViewBase'
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

  return (
    <CalendarViewBase
      displayTitle={displayTitle}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onPrev={handlePrev}
      onNext={handleNext}
      isLoading={isLoadingSettings}
    >
      {viewMode === 'month' ? (
        <MonthView
          currentDate={currentDate}
          monthlyGoals={[]}
          events={[]}
          tasks={[]}
          weekStartDay={weekStartDay}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          monthlyGoals={[]}
          weeklyGoals={[]}
          events={[]}
          tasks={[]}
          weekStartDay={weekStartDay}
        />
      )}
    </CalendarViewBase>
  )
}
