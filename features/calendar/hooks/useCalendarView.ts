import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useUserSettings } from '@/features/settings'
import {
  formatMonthYear,
  formatWeekRange,
  navigateMonth,
  navigateWeek,
} from '../lib/utils'

type ViewMode = 'month' | 'week'

function isValidViewMode(value: string): value is ViewMode {
  return value === 'month' || value === 'week'
}

interface UseCalendarViewOptions {
  initialDate?: Date
}

export function useCalendarView({ initialDate }: UseCalendarViewOptions = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { userSettings, isLoading: isLoadingSettings } = useUserSettings()
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())

  const weekStartDay = userSettings?.weekStartDay ?? 1
  const defaultView = userSettings?.defaultCalendarView
  const resolvedDefaultView: ViewMode = defaultView === 'month' ? 'month' : 'week'
  const viewFromUrl = searchParams.get('view')
  const viewMode: ViewMode =
    isValidViewMode(viewFromUrl ?? '') ? (viewFromUrl as ViewMode) : resolvedDefaultView

  const setViewMode = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', next)
    router.push(`${pathname}?${params.toString()}`)
  }

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
