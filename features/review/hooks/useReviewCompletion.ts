import { useEffect } from 'react'
import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getReviewCompletion,
  markReviewComplete as markReviewCompleteApi,
} from '../lib/review-completion'
import { SWR_KEYS } from '@/lib/swr-keys'
import type { ReviewMode } from '../types/review-completion'

export function useReviewCompletion(
  completedDate: string | null,
  type: string,
  mode: ReviewMode,
) {
  const key =
    completedDate !== null
      ? SWR_KEYS.reviewCompletion(completedDate, type, mode)
      : null

  const { data: isCompleted } = useSWR<boolean>(
    key,
    () =>
      completedDate !== null
        ? getReviewCompletion(completedDate, type, mode)
        : Promise.resolve(false),
  )

  useEffect(() => {
    if (key) mutate(key)
  }, [key])

  const markReviewComplete = async () => {
    if (completedDate === null) return
    await markReviewCompleteApi(completedDate, type, mode)
    if (key) await mutate(key)
  }

  return {
    isCompleted: isCompleted ?? false,
    isLoading: key !== null && isCompleted === undefined,
    markReviewComplete,
  }
}
