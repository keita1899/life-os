'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { ProjectForm } from './ProjectForm'
import type { DevProject, CreateDevProjectInput } from '@/lib/types/dev-project'

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateDevProjectInput) => Promise<void>
  project?: DevProject
}

export function ProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  project,
}: ProjectDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={project}
      title={{
        create: '新しいプロジェクトを作成',
        edit: 'プロジェクトを編集',
      }}
      formComponent={ProjectForm}
      contentClassName="max-w-2xl max-h-[90vh] overflow-y-auto"
    />
  )
}
