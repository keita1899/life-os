'use client'

import type { ReactElement } from 'react'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { mutate } from 'swr'
import { SWR_KEYS } from '@/lib/swr-keys'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { CreateButton } from '@/components/ui/create-button'
import { InlineEditableText } from '@/components/ui/inline-editable-text'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import {
  getJobApplicationById,
  updateJobApplication,
  deleteJobApplication,
  ApplicationDialog,
  ApplicationDetail,
  InterviewDialog,
  InterviewList,
  useJobInterviews,
} from '@/features/dev/job-applications'
import type {
  JobApplication,
  ApplicationStatus,
  CreateJobApplicationInput,
  JobInterview,
  CreateJobInterviewInput,
  UpdateJobInterviewInput,
} from '@/features/dev/job-applications'

function ApplicationDetailPageContent(): ReactElement | null {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const applicationId = idParam ? Number(idParam) : NaN

  const shouldFetch = Number.isFinite(applicationId)

  const { data, error, isLoading } = useSWR<JobApplication | null>(
    shouldFetch ? SWR_KEYS.jobApplication(applicationId) : null,
    () => getJobApplicationById(applicationId),
  )

  const applicationDialog = useDialogState<JobApplication>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const {
    operationError,
    setOperationError,
    execute,
  } = useAsyncOperation()

  const {
    interviews,
    isLoading: isInterviewsLoading,
    createInterview,
    updateInterview,
    deleteInterview,
  } = useJobInterviews(shouldFetch ? applicationId : null)

  const interviewDialog = useDialogState<JobInterview>()
  const interviewDeleteConfirm = useDeleteConfirm<JobInterview>()

  const handleUpdate = async (input: CreateJobApplicationInput) => {
    if (!shouldFetch) return
    await updateJobApplication(applicationId, input)
    await Promise.all([
      mutate(SWR_KEYS.jobApplication(applicationId)),
      mutate(SWR_KEYS.jobApplications),
    ])
    applicationDialog.handleDialogClose(false)
  }

  const handleRename = async (name: string) => {
    if (!shouldFetch) return
    await execute(async () => {
      await updateJobApplication(applicationId, { companyName: name })
      await Promise.all([
        mutate(SWR_KEYS.jobApplication(applicationId)),
        mutate(SWR_KEYS.jobApplications),
      ])
    }, '企業名の更新に失敗しました')
  }

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!shouldFetch || data?.status === newStatus) return
    await execute(async () => {
      await updateJobApplication(applicationId, { status: newStatus })
      await Promise.all([
        mutate(SWR_KEYS.jobApplication(applicationId)),
        mutate(SWR_KEYS.jobApplications),
      ])
    }, 'ステータスの更新に失敗しました')
  }

  const handleDelete = async () => {
    if (!shouldFetch) return
    try {
      setDeleteError(null)
      await deleteJobApplication(applicationId)
      await mutate(SWR_KEYS.jobApplications)
      router.push('/dev/applications')
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : '削除に失敗しました',
      )
      setIsDeleteDialogOpen(false)
    }
  }

  const handleCreateInterview = async (
    input: CreateJobInterviewInput,
  ): Promise<void> => {
    const result = await execute(
      () => createInterview(input),
      '面接の作成に失敗しました',
    )
    if (result !== undefined) {
      interviewDialog.handleDialogClose(false)
    }
  }

  const handleUpdateInterview = async (
    input: CreateJobInterviewInput,
  ): Promise<void> => {
    const interview = interviewDialog.editingItem
    if (!interview) return
    const updateInput: UpdateJobInterviewInput = {
      round: input.round,
      interviewType: input.interviewType,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      location: input.location,
      notes: input.notes,
      result: input.result,
    }
    const result = await execute(
      () => updateInterview(interview.id, updateInput),
      '面接の更新に失敗しました',
    )
    if (result !== undefined) {
      interviewDialog.handleDialogClose(false)
    }
  }

  const handleDeleteInterview = async (): Promise<void> => {
    const interview = interviewDeleteConfirm.deletingItem
    if (!interview) return
    const result = await execute(
      () => deleteInterview(interview.id),
      '面接の削除に失敗しました',
    )
    if (result !== undefined) {
      interviewDeleteConfirm.clearDeletingItem()
    }
  }

  const nextRound =
    interviews.length > 0
      ? Math.max(...interviews.map((i) => i.round)) + 1
      : 1

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/dev/applications"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            &larr; 応募一覧へ
          </Link>
          <h1 className="mt-2 text-3xl font-bold">
            {data ? (
              <InlineEditableText
                value={data.companyName}
                onSave={handleRename}
              />
            ) : (
              '応募詳細'
            )}
          </h1>
        </div>
        {data && (
          <EditDeleteDropdownMenu
            onEdit={() => applicationDialog.handleEdit(data)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        )}
      </div>

      <ErrorMessage
        message={deleteError || ''}
        onDismiss={deleteError ? () => setDeleteError(null) : undefined}
      />
      <ErrorMessage
        message={operationError || ''}
        onDismiss={
          operationError ? () => setOperationError(null) : undefined
        }
      />

      {!shouldFetch ? (
        <ErrorMessage message="不正な応募IDです" />
      ) : isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage
          message={
            error instanceof Error ? error.message : '取得に失敗しました'
          }
        />
      ) : !data ? (
        <ErrorMessage message="応募が見つかりませんでした" />
      ) : (
        <div className="space-y-8">
          <ApplicationDetail
            application={data}
            onStatusChange={(status) => void handleStatusChange(status)}
          />

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">面接一覧</h2>
              <CreateButton
                label="面接を追加"
                onClick={interviewDialog.handleCreateClick}
              />
            </div>
            {isInterviewsLoading ? (
              <Loading />
            ) : (
              <InterviewList
                interviews={interviews}
                onEdit={interviewDialog.handleEdit}
                onDelete={interviewDeleteConfirm.handleDeleteClick}
              />
            )}
          </section>
        </div>
      )}

      {data && (
        <ApplicationDialog
          open={applicationDialog.isDialogOpen}
          onOpenChange={applicationDialog.handleDialogClose}
          onSubmit={handleUpdate}
          application={applicationDialog.editingItem ?? data}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        message={
          data ? `「${data.companyName}」を削除してもよろしいですか？` : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {shouldFetch && (
        <InterviewDialog
          open={interviewDialog.isDialogOpen}
          onOpenChange={interviewDialog.handleDialogClose}
          onSubmit={
            interviewDialog.editingItem
              ? handleUpdateInterview
              : handleCreateInterview
          }
          interview={interviewDialog.editingItem}
          applicationId={applicationId}
          defaultRound={nextRound}
        />
      )}

      <DeleteConfirmDialog
        open={!!interviewDeleteConfirm.deletingItem}
        message="この面接を削除しますか？この操作は取り消せません。"
        onConfirm={handleDeleteInterview}
        onCancel={interviewDeleteConfirm.handleDeleteCancel}
      />
    </div>
  )
}

export default function ApplicationDetailPage(): ReactElement {
  return (
    <Suspense fallback={<Loading />}>
      <ApplicationDetailPageContent />
    </Suspense>
  )
}
