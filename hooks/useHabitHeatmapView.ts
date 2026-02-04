import { useState, useEffect } from 'react'
import { useUserSettings } from '@/hooks/useUserSettings'
import {
  formatMonthYear,
  formatWeekRange,
  navigateMonth,
  navigateWeek,
} from '@/lib/calendar/utils'

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
  const defaultHabitView = userSettings?.defaultHabitView ?? 'month'
  const viewMode: HabitHeatmapViewMode = viewModeOverride ?? defaultHabitView
  const setViewMode = (next: HabitHeatmapViewMode) => setViewModeOverride(next)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      if (isInputFocused) return

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setViewMode('month')
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        setViewMode('week')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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
