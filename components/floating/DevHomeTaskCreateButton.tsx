'use client'

import { useMemo, useState } from 'react'
import { CheckSquare } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { useDevProjects } from '@/hooks/useDevProjects'
import { createDevTask } from '@/lib/dev/tasks'
import { mutate } from 'swr'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskForm } from '@/components/tasks/TaskForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'
import type { CreateTaskInput } from '@/lib/types/task'

type DevTaskTarget =
  | { kind: 'type'; value: 'inbox' | 'learning' }
  | { kind: 'project'; projectId: number }

function parseDevTaskTarget(value: string): DevTaskTarget | null {
  if (value === 'inbox' || value === 'learning') {
    return { kind: 'type', value }
  }
  if (value.startsWith('project:')) {
    const id = Number(value.slice('project:'.length))
    if (!Number.isFinite(id)) return null
    return { kind: 'project', projectId: id }
  }
  return null
}

export function DevHomeTaskCreateButton() {
  const { projects } = useDevProjects()
  const [operationError, setOperationError] = useState<string | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [targetValue, setTargetValue] = useState<string>('inbox')

  const target = useMemo(() => parseDevTaskTarget(targetValue), [targetValue])

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      if (!target) {
        setOperationError('タスクの作成先が無効です')
        return
      }

      setOperationError(null)
      if (target.kind === 'type') {
        await createDevTask({
          title: input.title,
          projectId: null,
          type: target.value,
          executionDate: input.executionDate,
        })
      } else {
        await createDevTask({
          title: input.title,
          projectId: target.projectId,
          type: 'inbox',
          executionDate: input.executionDate,
        })
      }
      await mutate('dev-calendar-tasks')
      setIsTaskDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの作成に失敗しました',
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
            id: 'create-dev-task',
            label: 'タスクを作成',
            icon: <CheckSquare className="h-5 w-5" />,
            onClick: () => setIsTaskDialogOpen(true),
          },
        ]}
      />

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいタスクを作成</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">作成先</div>
              <Select
                value={targetValue}
                onValueChange={(value) => {
                  if (!parseDevTaskTarget(value)) return
                  setTargetValue(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="作成先を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">Inbox</SelectItem>
                  <SelectItem value="learning">学習</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={`project:${p.id}`}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setIsTaskDialogOpen(false)}
              submitLabel="作成"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

