'use client'

import type { ReactElement } from 'react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorMessage } from '@/components/ui/error-message'
import { InterviewForm } from './InterviewForm'
import { formatSubmitLabelWithShortcut } from '@/lib/utils/shortcut'
import type {
  JobInterview,
  CreateJobInterviewInput,
} from '../types/job-interview'

interface InterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateJobInterviewInput) => Promise<void>
  interview?: JobInterview | null
  applicationId: number
  defaultRound?: number
}

export function InterviewDialog({
  open,
  onOpenChange,
  onSubmit,
  interview,
  applicationId,
  defaultRound = 1,
}: InterviewDialogProps): ReactElement {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSubmitError(null)
    }
  }

  const isEditMode = !!interview

  const handleSubmit = async (input: CreateJobInterviewInput) => {
    try {
      setSubmitError(null)
      await onSubmit(input)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : '送信に失敗しました',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '面接を編集' : '面接を追加'}
          </DialogTitle>
        </DialogHeader>
        <ErrorMessage
          message={submitError || ''}
          onDismiss={submitError ? () => setSubmitError(null) : undefined}
        />
        <InterviewForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={interview ?? undefined}
          submitLabel={formatSubmitLabelWithShortcut(
            isEditMode ? '更新' : '作成',
          )}
          applicationId={applicationId}
          defaultRound={defaultRound}
        />
      </DialogContent>
    </Dialog>
  )
}
