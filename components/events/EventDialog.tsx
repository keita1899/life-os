'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EventForm } from './EventForm'
import type { Event, CreateEventInput } from '@/lib/types/event'

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateEventInput) => Promise<void>
  event?: Event
}

export const EventDialog = ({
  open,
  onOpenChange,
  onSubmit,
  event,
}: EventDialogProps) => {
  const handleSubmit = async (input: CreateEventInput) => {
    await onSubmit(input)
  }

  const isEditMode = !!event

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '予定を編集' : '新しい予定を作成'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? '予定の詳細を編集してください'
              : '予定の詳細を入力してください'}
          </DialogDescription>
        </DialogHeader>
        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={event}
          submitLabel={isEditMode ? '更新' : '作成'}
        />
      </DialogContent>
    </Dialog>
  )
}
