import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useUserSettings } from '@/features/settings'
import {
  formatMonthYear,
  formatWeekRange,
  navigateMonth,
  navigateWeek,
} from '@/features/calendar'

export type HabitHeatmapViewMode = 'month' | 'week'

interface UseHabitHeatmapViewOptions {
  initialDate?: Date
}

export function useHabitHeatmapView({
  initialDate,
}: UseHabitHeatmapViewOptions = {}) {
  const { userSettings } = useUserSettings()
  const [currentDate, setCurrentDate] = useState(initialDate ?? new Date())
  const [viewModeOverride, setViewModeOverride] =
    useState<HabitHeatmapViewMode | null>(null)

  const weekStartDay = userSettings?.weekStartDay ?? 1
  const defaultHabitView = userSettings?.defaultHabitView ?? 'week'
  const viewMode: HabitHeatmapViewMode = viewModeOverride ?? defaultHabitView
  const setViewMode = (next: HabitHeatmapViewMode) => setViewModeOverride(next)

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

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  return {
    currentDate,
    viewMode,
    setViewMode,
    weekStartDay,
    handlePrev,
    handleNext,
    displayTitle,
    year,
    month,
  }
}
