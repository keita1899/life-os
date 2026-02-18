'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { format } from 'date-fns'
import { useAppMode } from '@/hooks/useAppMode'
import { useUserSettings } from '@/features/settings'
import { getWeekStartDate, getWeekDays } from '@/features/calendar'
import { useReviewCompletion } from '../hooks/useReviewCompletion'
import type { ReviewMode, ReviewWizardType } from '../types/review-completion'

function isTimePastOrEqual(current: string, target: string): boolean {
  return current >= target
}

interface ReviewWizardContextValue {
  activeWizard: ReviewWizardType | null
  handleComplete: () => Promise<void>
}

const ReviewWizardContext = createContext<ReviewWizardContextValue | null>(null)

export function useReviewWizardContext(): ReviewWizardContextValue | null {
  return useContext(ReviewWizardContext)
}

interface ReviewWizardProviderProps {
  children: React.ReactNode
}

interface WizardConfig {
  type: ReviewWizardType
  shouldShow: boolean
  markComplete: () => Promise<void>
}

export function ReviewWizardProvider({ children }: ReviewWizardProviderProps) {
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
    markReviewComplete: markMorningComplete,
  } = useReviewCompletion(today, 'morning', mode as ReviewMode)
  const {
    isCompleted: eveningCompleted,
    markReviewComplete: markEveningComplete,
  } = useReviewCompletion(today, 'evening', mode as ReviewMode)
  const {
    isCompleted: weekStartCompleted,
    markReviewComplete: markWeekStartComplete,
  } = useReviewCompletion(weekStartDateStr, 'week_start', mode as ReviewMode)
  const {
    isCompleted: weekEndCompleted,
    markReviewComplete: markWeekEndComplete,
  } = useReviewCompletion(weekStartDateStr, 'week_end', mode as ReviewMode)

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

  const wizardConfigs = useMemo((): WizardConfig[] => {
    return [
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

  const activeWizard = useMemo(
    (): ReviewWizardType | null =>
      wizardConfigs.find((c) => c.shouldShow)?.type ?? null,
    [wizardConfigs],
  )

  const handleComplete = useCallback(async () => {
    const config = wizardConfigs.find((c) => c.shouldShow)
    if (config) await config.markComplete()
  }, [wizardConfigs])

  const value = useMemo<ReviewWizardContextValue>(
    () => ({ activeWizard, handleComplete }),
    [activeWizard, handleComplete],
  )

  return (
    <ReviewWizardContext.Provider value={value}>
      {children}
    </ReviewWizardContext.Provider>
  )
}
