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
import { useReviewCompletion } from '../hooks/useReviewCompletion'
import type { ReviewMode } from '../types/review-completion'

type ReviewWizardType = 'morning' | 'evening'

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

  const today = format(now, 'yyyy-MM-dd')
  const currentTime = format(now, 'HH:mm')
  const morningTime = userSettings?.morningReviewTime ?? null
  const eveningTime = userSettings?.eveningReviewTime ?? null

  const {
    isCompleted: morningCompleted,
    markReviewComplete: markMorningComplete,
  } = useReviewCompletion(today, 'morning', mode as ReviewMode)
  const {
    isCompleted: eveningCompleted,
    markReviewComplete: markEveningComplete,
  } = useReviewCompletion(today, 'evening', mode as ReviewMode)

  const activeWizard = useMemo((): ReviewWizardType | null => {
    if (morningTime && isTimePastOrEqual(currentTime, morningTime) && !morningCompleted) {
      return 'morning'
    }
    if (eveningTime && isTimePastOrEqual(currentTime, eveningTime) && !eveningCompleted) {
      return 'evening'
    }
    return null
  }, [
    morningTime,
    eveningTime,
    currentTime,
    morningCompleted,
    eveningCompleted,
  ])

  const handleComplete = useCallback(async () => {
    if (activeWizard === 'morning') {
      await markMorningComplete()
    } else if (activeWizard === 'evening') {
      await markEveningComplete()
    }
  }, [activeWizard, markMorningComplete, markEveningComplete])

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
