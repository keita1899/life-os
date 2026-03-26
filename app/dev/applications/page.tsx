'use client'

import { useState, useMemo } from 'react'
import { CreateButton } from '@/components/ui/create-button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ApplicationList,
  ApplicationDialog,
  useJobApplications,
} from '@/features/dev/job-applications'
import type {
  CreateJobApplicationInput,
  JobInterview,
} from '@/features/dev/job-applications'
import { getInterviewsByApplicationId } from '@/features/dev/job-applications'
import { Loading } from '@/components/ui/loading'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { ErrorMessage } from '@/components/ui/error-message'
import { useDialogState } from '@/hooks/useDialogState'
import type { JobApplication } from '@/features/dev/job-applications'
import useSWR from 'swr'

type ListFilter = 'all' | 'active' | 'closed'

export default function DevApplicationsPage() {
  const {
    applications,
    isLoading,
    error,
    createApplication,
  } = useJobApplications()
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const [filter, setFilter] = useState<ListFilter>('all')
  const applicationDialog = useDialogState<JobApplication>()

  useCreateShortcut({
    onCreate: applicationDialog.handleCreateClick,
    enabled: !applicationDialog.isDialogOpen,
  })

  // 全応募の次の面接日を取得
  const applicationIds = useMemo(
    () => applications.map((a) => a.id),
    [applications],
  )
  const { data: nextInterviewMap } = useSWR(
    applicationIds.length > 0
      ? ['next-interviews', ...applicationIds]
      : null,
    async () => {
      const map = new Map<number, JobInterview>()
      const today = new Date().toISOString().split('T')[0]
      await Promise.all(
        applicationIds.map(async (id) => {
          const interviews = await getInterviewsByApplicationId(id)
          const upcoming = interviews
            .filter(
              (i) =>
                i.scheduledDate &&
                i.scheduledDate >= today &&
                i.result !== 'failed' &&
                i.result !== 'cancelled',
            )
            .sort((a, b) =>
              (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''),
            )
          if (upcoming.length > 0) {
            map.set(id, upcoming[0])
          }
        }),
      )
      return map
    },
  )

  const handleFilterChange = (value: string) => {
    if (value === 'all' || value === 'active' || value === 'closed') {
      setFilter(value)
    }
  }

  const handleCreate = async (
    input: CreateJobApplicationInput,
  ): Promise<void> => {
    await execute(
      () => createApplication(input),
      '応募の作成に失敗しました',
    )
    applicationDialog.handleDialogClose(false)
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">応募管理</h1>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="フィルター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="active">選考中</SelectItem>
              <SelectItem value="closed">終了済み</SelectItem>
            </SelectContent>
          </Select>
          <CreateButton
            label="応募を作成"
            onClick={applicationDialog.handleCreateClick}
            title="&#x2318;N で作成"
          />
        </div>
      </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={
          operationError ? () => setOperationError(null) : undefined
        }
      />

      {isLoading ? (
        <Loading />
      ) : (
        <ApplicationList
          applications={applications}
          filter={filter}
          nextInterviewMap={nextInterviewMap ?? undefined}
        />
      )}

      <ApplicationDialog
        open={applicationDialog.isDialogOpen}
        onOpenChange={applicationDialog.handleDialogClose}
        onSubmit={handleCreate}
      />
    </div>
  )
}
