import { useCallback } from 'react'
import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getReviewCompletion,
  markReviewComplete as markReviewCompleteApi,
} from '../lib/review-completion'
import { SWR_KEYS } from '@/lib/swr-keys'
import type { ReviewMode, ReviewType } from '../types/review-completion'

export interface UseReviewCompletionResult {
  isCompleted: boolean
  isLoading: boolean
  markReviewComplete: () => Promise<void>
}

export function useReviewCompletion(
  completedDate: string | null,
  type: ReviewType,
  mode: ReviewMode,
): UseReviewCompletionResult {
  const key =
    completedDate !== null
      ? SWR_KEYS.reviewCompletion(completedDate, type, mode)
      : null

  const { data: isCompleted, isLoading } = useSWR<boolean>(
    key,
    () =>
      completedDate !== null
        ? getReviewCompletion(completedDate, type, mode)
        : Promise.resolve(false),
  )

  const markReviewComplete = useCallback(async (): Promise<void> => {
    if (completedDate === null) return
    await markReviewCompleteApi(completedDate, type, mode)
    if (key) await mutate(key)
  }, [completedDate, type, mode, key])

  return {
    isCompleted: isCompleted ?? false,
    isLoading: isLoading ?? false,
    markReviewComplete,
  }
}
