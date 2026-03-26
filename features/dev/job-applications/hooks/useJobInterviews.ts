import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getInterviewsByApplicationId,
  createJobInterview,
  updateJobInterview,
  deleteJobInterview,
} from '../lib'
import type {
  JobInterview,
  CreateJobInterviewInput,
  UpdateJobInterviewInput,
} from '../types/job-interview'
import { SWR_KEYS } from '@/lib/swr-keys'

interface UseJobInterviewsResult {
  interviews: JobInterview[]
  isLoading: boolean
  error: string | null
  createInterview: (input: CreateJobInterviewInput) => Promise<JobInterview>
  updateInterview: (
    id: number,
    input: UpdateJobInterviewInput,
  ) => Promise<void>
  deleteInterview: (id: number) => Promise<void>
}

export function useJobInterviews(
  applicationId: number | null,
): UseJobInterviewsResult {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<JobInterview[]>(
    applicationId != null ? SWR_KEYS.jobInterviews(applicationId) : null,
    () => getInterviewsByApplicationId(applicationId!),
  )

  const handleCreate = async (
    input: CreateJobInterviewInput,
  ): Promise<JobInterview> => {
    const interview = await createJobInterview(input)
    if (applicationId != null) {
      await mutate(SWR_KEYS.jobInterviews(applicationId))
    }
    return interview
  }

  const handleUpdate = async (
    id: number,
    input: UpdateJobInterviewInput,
  ): Promise<void> => {
    await updateJobInterview(id, input)
    if (applicationId != null) {
      await mutate(SWR_KEYS.jobInterviews(applicationId))
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    await deleteJobInterview(id)
    if (applicationId != null) {
      await mutate(SWR_KEYS.jobInterviews(applicationId))
    }
  }

  return {
    interviews: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch interviews'
      : null,
    createInterview: handleCreate,
    updateInterview: handleUpdate,
    deleteInterview: handleDelete,
  }
}
