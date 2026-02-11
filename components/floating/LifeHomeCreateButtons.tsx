'use client'

import { useState } from 'react'
import { CalendarPlus, CheckSquare } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { TaskDialog, useTasks, type CreateTaskInput } from '@/features/tasks'
import { EventDialog, useEvents } from '@/features/events'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import type { CreateEventInput } from '@/features/events'

export function LifeHomeCreateButtons() {
  const { createTask } = useTasks()
  const { createEvent } = useEvents()
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)

  const handleCreateTask = async (input: CreateTaskInput) => {
    const result = await execute(
      () => createTask(input),
      'タスクの作成に失敗しました',
    )
    if (result !== undefined) {
      setIsTaskDialogOpen(false)
    }
  }

  const handleCreateEvent = async (input: CreateEventInput) => {
    const result = await execute(
      () => createEvent(input),
      '予定の作成に失敗しました',
    )
    if (result !== undefined) {
      setIsEventDialogOpen(false)
    }
  }

  return (
    <>
      <ErrorMessage
        message={operationError || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />
      <FloatingActionButtons
        actions={[
          {
            id: 'create-event',
            label: '予定を作成',
            icon: <CalendarPlus className="h-5 w-5" />,
            onClick: () => setIsEventDialogOpen(true),
          },
          {
            id: 'create-task',
            label: 'タスクを作成',
            icon: <CheckSquare className="h-5 w-5" />,
            onClick: () => setIsTaskDialogOpen(true),
          },
        ]}
      />
      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSubmit={handleCreateEvent}
      />
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSubmit={handleCreateTask}
      />
    </>
  )
}

