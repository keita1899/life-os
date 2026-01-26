import { useState, useEffect } from 'react'
import { useUserSettings } from '@/hooks/useUserSettings'
import {
  formatMonthYear,
  formatWeekRange,
  navigateMonth,
  navigateWeek,
} from '@/lib/calendar/utils'

type ViewMode = 'month' | 'week'

interface UseCalendarViewOptions {
  initialDate?: Date
}

export function useCalendarView({ initialDate }: UseCalendarViewOptions = {}) {
  const { userSettings, isLoading: isLoadingSettings } = useUserSettings()
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())
  const [viewModeOverride, setViewModeOverride] = useState<ViewMode | null>(null)

  const weekStartDay = userSettings?.weekStartDay ?? 0

  const defaultView = userSettings?.defaultCalendarView
  const resolvedDefaultView: ViewMode = defaultView === 'week' ? 'week' : 'month'
  const viewMode: ViewMode = viewModeOverride ?? resolvedDefaultView
  const setViewMode = (next: ViewMode) => setViewModeOverride(next)

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

  return {
    currentDate,
    viewMode,
    setViewMode,
    weekStartDay,
    isLoadingSettings,
    handlePrev,
    handleNext,
    displayTitle,
  }
}
