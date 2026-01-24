'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorMessage } from '@/components/ui/error-message'

interface FormDialogProps<
  TData,
  TInitialData = TData,
  TFormProps = Record<string, unknown>,
> {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: TData) => Promise<void>
  initialData?: TInitialData
  title: {
    create: string
    edit: string
  }
  formComponent: React.ComponentType<{
    onSubmit: (input: TData) => Promise<void>
    onCancel?: () => void
    initialData?: TInitialData
    submitLabel?: string
  } & TFormProps>
  formProps?: TFormProps
  contentClassName?: string
  closeOnSubmit?: boolean
}

export function FormDialog<
  TData,
  TInitialData = TData,
  TFormProps = Record<string, unknown>,
>({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  formComponent: FormComponent,
  formProps,
  contentClassName,
  closeOnSubmit = false,
}: FormDialogProps<TData, TInitialData, TFormProps>) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSubmitError(null)
    }
  }, [open])

  const handleSubmit = async (input: TData) => {
    try {
      setSubmitError(null)
      await onSubmit(input)
      if (closeOnSubmit) {
        onOpenChange(false)
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : '送信に失敗しました',
      )
    }
  }

  const isEditMode = !!initialData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? title.edit : title.create}
          </DialogTitle>
        </DialogHeader>
        <ErrorMessage
          message={submitError || ''}
          onDismiss={submitError ? () => setSubmitError(null) : undefined}
        />
        <FormComponent
          {...({
            onSubmit: handleSubmit,
            onCancel: () => onOpenChange(false),
            initialData,
            submitLabel: isEditMode ? '更新' : '作成',
            ...formProps,
          } as React.ComponentProps<typeof FormComponent>)}
        />
      </DialogContent>
    </Dialog>
  )
}
