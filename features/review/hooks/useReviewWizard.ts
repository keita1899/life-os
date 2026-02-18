'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { useAppMode } from '@/hooks/useAppMode'
import { useUserSettings } from '@/features/settings'
import { getWeekStartDate, getWeekDays } from '@/features/calendar'
import { useReviewCompletion } from './useReviewCompletion'
import type { ReviewMode, ReviewWizardType } from '../types/review-completion'

function isTimePastOrEqual(current: string, target: string): boolean {
  return current >= target
}

interface WizardConfig {
  type: ReviewWizardType
  shouldShow: boolean
  markComplete: () => Promise<void>
}

export interface UseReviewWizardResult {
  activeWizard: ReviewWizardType | null
  handleComplete: () => Promise<void>
}

export function useReviewWizard(): UseReviewWizardResult {
  const { mode } = useAppMode()
  const { userSettings } = useUserSettings()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const updateNow = () => setNow(new Date())
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') updateNow()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', updateNow)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', updateNow)
    }
  }, [])

  const weekStartDay = userSettings?.weekStartDay ?? 1
  const weekStartDate = useMemo(
    () => getWeekStartDate(now, weekStartDay),
    [now, weekStartDay],
  )
  const weekDays = useMemo(
    () => getWeekDays(now, weekStartDay),
    [now, weekStartDay],
  )
  const weekEndDate = weekDays[weekDays.length - 1]
  const weekStartDateStr = format(weekStartDate, 'yyyy-MM-dd')
  const today = format(now, 'yyyy-MM-dd')
  const currentTime = format(now, 'HH:mm')
  const morningTime = userSettings?.morningReviewTime ?? null
  const eveningTime = userSettings?.eveningReviewTime ?? null
  const weekStartReviewTime = userSettings?.weekStartReviewTime ?? null
  const weekEndReviewTime = userSettings?.weekEndReviewTime ?? null

  const {
    isCompleted: morningCompleted,
    isLoading: morningLoading,
    markReviewComplete: markMorningComplete,
  } = useReviewCompletion(today, 'morning', mode as ReviewMode)
  const {
    isCompleted: eveningCompleted,
    isLoading: eveningLoading,
    markReviewComplete: markEveningComplete,
  } = useReviewCompletion(today, 'evening', mode as ReviewMode)
  const {
    isCompleted: weekStartCompleted,
    isLoading: weekStartLoading,
    markReviewComplete: markWeekStartComplete,
  } = useReviewCompletion(weekStartDateStr, 'week_start', mode as ReviewMode)
  const {
    isCompleted: weekEndCompleted,
    isLoading: weekEndLoading,
    markReviewComplete: markWeekEndComplete,
  } = useReviewCompletion(weekStartDateStr, 'week_end', mode as ReviewMode)

  const monthStartDateStr = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEndDateStr = format(endOfMonth(now), 'yyyy-MM-dd')
  const {
    isCompleted: monthStartCompleted,
    isLoading: monthStartLoading,
    markReviewComplete: markMonthStartComplete,
  } = useReviewCompletion(monthStartDateStr, 'month_start', mode as ReviewMode)
  const {
    isCompleted: monthEndCompleted,
    isLoading: monthEndLoading,
    markReviewComplete: markMonthEndComplete,
  } = useReviewCompletion(monthEndDateStr, 'month_end', mode as ReviewMode)

  const yearStartDateStr = format(startOfYear(now), 'yyyy-MM-dd')
  const yearEndDateStr = format(endOfYear(now), 'yyyy-MM-dd')
  const {
    isCompleted: yearStartCompleted,
    isLoading: yearStartLoading,
    markReviewComplete: markYearStartComplete,
  } = useReviewCompletion(yearStartDateStr, 'year_start', mode as ReviewMode)
  const {
    isCompleted: yearEndCompleted,
    isLoading: yearEndLoading,
    markReviewComplete: markYearEndComplete,
  } = useReviewCompletion(yearEndDateStr, 'year_end', mode as ReviewMode)

  const isAnyCompletionLoading =
    morningLoading ||
    eveningLoading ||
    weekStartLoading ||
    weekEndLoading ||
    monthStartLoading ||
    monthEndLoading ||
    yearStartLoading ||
    yearEndLoading

  const isTodayWeekStart = today === weekStartDateStr
  const isTodayWeekEnd = weekEndDate
    ? today === format(weekEndDate, 'yyyy-MM-dd')
    : false
  const weekStartTimeOk =
    !weekStartReviewTime ||
    isTimePastOrEqual(currentTime, weekStartReviewTime)
  const weekEndTimeOk =
    !weekEndReviewTime ||
    isTimePastOrEqual(currentTime, weekEndReviewTime)

  const isTodayMonthStart = today === monthStartDateStr
  const isTodayMonthEnd = today === monthEndDateStr
  const isTodayYearStart = today === yearStartDateStr
  const isTodayYearEnd = today === yearEndDateStr

  const wizardConfigs = useMemo((): WizardConfig[] => {
    return [
      {
        type: 'year_start',
        shouldShow: isTodayYearStart && !yearStartCompleted,
        markComplete: markYearStartComplete,
      },
      {
        type: 'month_start',
        shouldShow: isTodayMonthStart && !monthStartCompleted,
        markComplete: markMonthStartComplete,
      },
      {
        type: 'week_start',
        shouldShow:
          isTodayWeekStart && weekStartTimeOk && !weekStartCompleted,
        markComplete: markWeekStartComplete,
      },
      {
        type: 'morning',
        shouldShow:
          !!(
            morningTime &&
            isTimePastOrEqual(currentTime, morningTime) &&
            !morningCompleted
          ),
        markComplete: markMorningComplete,
      },
      {
        type: 'week_end',
        shouldShow:
          isTodayWeekEnd && weekEndTimeOk && !weekEndCompleted,
        markComplete: markWeekEndComplete,
      },
      {
        type: 'month_end',
        shouldShow: isTodayMonthEnd && !monthEndCompleted,
        markComplete: markMonthEndComplete,
      },
      {
        type: 'year_end',
        shouldShow: isTodayYearEnd && !yearEndCompleted,
        markComplete: markYearEndComplete,
      },
      {
        type: 'evening',
        shouldShow:
          !!(
            eveningTime &&
            isTimePastOrEqual(currentTime, eveningTime) &&
            !eveningCompleted
          ),
        markComplete: markEveningComplete,
      },
    ]
  }, [
    isTodayYearStart,
    isTodayYearEnd,
    yearStartCompleted,
    yearEndCompleted,
    markYearStartComplete,
    markYearEndComplete,
    isTodayMonthStart,
    isTodayMonthEnd,
    monthStartCompleted,
    monthEndCompleted,
    markMonthStartComplete,
    markMonthEndComplete,
    isTodayWeekStart,
    isTodayWeekEnd,
    weekStartTimeOk,
    weekEndTimeOk,
    weekStartCompleted,
    weekEndCompleted,
    morningTime,
    eveningTime,
    currentTime,
    morningCompleted,
    eveningCompleted,
    markWeekStartComplete,
    markMorningComplete,
    markWeekEndComplete,
    markEveningComplete,
  ])

  const activeWizard = useMemo((): ReviewWizardType | null => {
    if (isAnyCompletionLoading) return null
    return wizardConfigs.find((c) => c.shouldShow)?.type ?? null
  }, [wizardConfigs, isAnyCompletionLoading])

  const handleComplete = useCallback(async () => {
    if (!activeWizard) return
    const config = wizardConfigs.find((c) => c.type === activeWizard)
    if (config) await config.markComplete()
  }, [activeWizard, wizardConfigs])

  return { activeWizard, handleComplete }
}
