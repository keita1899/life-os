'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { EventForm } from './EventForm'
import type { Event, CreateEventInput } from '../types/event'

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateEventInput) => Promise<void>
  event?: Event
  defaultTitle?: string
  defaultStartDate?: string
}

export const EventDialog = ({
  open,
  onOpenChange,
  onSubmit,
  event,
  defaultTitle,
  defaultStartDate,
}: EventDialogProps) => {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={event}
      title={{
        create: '新しい予定を作成',
        edit: '予定を編集',
      }}
      formComponent={EventForm}
      formProps={{ defaultTitle, defaultStartDate }}
      contentClassName="max-w-2xl max-h-[90vh] overflow-y-auto"
    />
  )
}
