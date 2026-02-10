import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useUserSettings } from '@/features/settings'
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

  useHotkeys(
    'm',
    () => setViewMode('month'),
    { enableOnFormTags: false, preventDefault: true },
    [],
  )
  useHotkeys(
    'w',
    () => setViewMode('week'),
    { enableOnFormTags: false, preventDefault: true },
    [],
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
