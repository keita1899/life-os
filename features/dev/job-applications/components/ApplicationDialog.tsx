'use client'

import type { ReactElement } from 'react'
import { FormDialog } from '@/components/ui/form-dialog'
import { ApplicationForm } from './ApplicationForm'
import type {
  JobApplication,
  CreateJobApplicationInput,
} from '../types/job-application'

interface ApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateJobApplicationInput) => Promise<void>
  application?: JobApplication
}

export function ApplicationDialog({
  open,
  onOpenChange,
  onSubmit,
  application,
}: ApplicationDialogProps): ReactElement {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={application}
      title={{
        create: '新しい応募を作成',
        edit: '応募を編集',
      }}
      formComponent={ApplicationForm}
      contentClassName="max-w-2xl max-h-[90vh] overflow-y-auto"
    />
  )
}
