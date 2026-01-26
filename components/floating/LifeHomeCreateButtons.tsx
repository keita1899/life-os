'use client'

import { useState } from 'react'
import { CalendarPlus, CheckSquare } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { EventDialog } from '@/components/events/EventDialog'
import { useTasks } from '@/hooks/useTasks'
import { useEvents } from '@/hooks/useEvents'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import type { CreateTaskInput } from '@/lib/types/task'
import type { CreateEventInput } from '@/lib/types/event'

export function LifeHomeCreateButtons() {
  const { createTask } = useTasks()
  const { createEvent } = useEvents()
  const [operationError, setOperationError] = useState<string | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      setOperationError(null)
      await createTask(input)
      setIsTaskDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの作成に失敗しました',
      )
    }
  }

  const handleCreateEvent = async (input: CreateEventInput) => {
    try {
      setOperationError(null)
      await createEvent(input)
      setIsEventDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '予定の作成に失敗しました',
      )
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

