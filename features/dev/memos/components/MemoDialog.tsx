'use client'

import type { ReactElement } from 'react'
import { FormDialog } from '@/components/ui/form-dialog'
import { MemoForm } from './MemoForm'
import type { DevMemo, CreateDevMemoInput } from '../types/dev-memo'

interface MemoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateDevMemoInput) => Promise<void>
  memo?: DevMemo
  fixedProjectId?: number | null
}

export function MemoDialog({
  open,
  onOpenChange,
  onSubmit,
  memo,
  fixedProjectId,
}: MemoDialogProps): ReactElement {
  return (
    <FormDialog<CreateDevMemoInput, DevMemo, { fixedProjectId?: number | null }>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={memo}
      title={{
        create: 'メモを作成',
        edit: 'メモを編集',
      }}
      formComponent={MemoForm}
      formProps={{ fixedProjectId }}
      contentClassName="max-w-2xl max-h-[90vh] overflow-y-auto"
      closeOnSubmit
    />
  )
}
