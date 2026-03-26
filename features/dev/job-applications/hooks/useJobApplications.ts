import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllJobApplications,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
} from '../lib'
import type {
  JobApplication,
  CreateJobApplicationInput,
  UpdateJobApplicationInput,
} from '../types/job-application'
import { SWR_KEYS } from '@/lib/swr-keys'

interface UseJobApplicationsResult {
  applications: JobApplication[]
  isLoading: boolean
  error: string | null
  createApplication: (input: CreateJobApplicationInput) => Promise<JobApplication>
  updateApplication: (
    id: number,
    input: UpdateJobApplicationInput,
  ) => Promise<void>
  deleteApplication: (id: number) => Promise<void>
  refreshApplications: () => Promise<JobApplication[] | undefined>
}

export function useJobApplications(): UseJobApplicationsResult {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<JobApplication[]>(SWR_KEYS.jobApplications, () =>
    getAllJobApplications(),
  )

  const handleCreate = async (
    input: CreateJobApplicationInput,
  ): Promise<JobApplication> => {
    const application = await createJobApplication(input)
    await mutate(SWR_KEYS.jobApplications)
    return application
  }

  const handleUpdate = async (
    id: number,
    input: UpdateJobApplicationInput,
  ): Promise<void> => {
    await updateJobApplication(id, input)
    await Promise.all([
      mutate(SWR_KEYS.jobApplications),
      mutate(SWR_KEYS.jobApplication(id)),
    ])
  }

  const handleDelete = async (id: number): Promise<void> => {
    await deleteJobApplication(id)
    await mutate(SWR_KEYS.jobApplications)
  }

  const refreshApplications = async (): Promise<
    JobApplication[] | undefined
  > => {
    return await mutate(SWR_KEYS.jobApplications)
  }

  return {
    applications: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch job applications'
      : null,
    createApplication: handleCreate,
    updateApplication: handleUpdate,
    deleteApplication: handleDelete,
    refreshApplications,
  }
}
