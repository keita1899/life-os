import useSWR from 'swr'
import { getRoadmapTaskCounts, type RoadmapTaskCounts } from '../lib/task'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useRoadmapTaskCounts() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<RoadmapTaskCounts[]>(SWR_KEYS.roadmapTaskCounts, () =>
    getRoadmapTaskCounts(),
  )

  return {
    counts: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch roadmap task counts'
      : null,
  }
}
