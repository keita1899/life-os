'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorMessage } from '@/components/ui/error-message'
import { formatSubmitLabelWithShortcut } from '@/lib/utils/shortcut'
import { RoadmapTaskForm } from './RoadmapTaskForm'
import type { RoadmapTask, CreateRoadmapTaskInput } from '../types/roadmap-task'
import type { RoadmapSection } from '../types/roadmap-section'

interface RoadmapTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateRoadmapTaskInput) => Promise<void>
  task?: RoadmapTask
  sections?: RoadmapSection[]
  projectId: number
  defaultSectionId?: string
  defaultTargetYear?: string
  defaultTargetMonth?: string
}

export function RoadmapTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  sections,
  projectId,
  defaultSectionId,
  defaultTargetYear,
  defaultTargetMonth,
}: RoadmapTaskDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSubmitError(null)
    }
  }

  const isEditMode = !!task
  const submitLabel = formatSubmitLabelWithShortcut(
    isEditMode ? '更新' : '作成',
  )

  const handleSubmit = async (input: CreateRoadmapTaskInput) => {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'タスクを編集' : '新しいタスクを作成'}
          </DialogTitle>
        </DialogHeader>
        <ErrorMessage
          message={submitError || ''}
          onDismiss={submitError ? () => setSubmitError(null) : undefined}
        />
        <RoadmapTaskForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={task}
          sections={sections}
          projectId={projectId}
          defaultSectionId={defaultSectionId}
          defaultTargetYear={defaultTargetYear}
          defaultTargetMonth={defaultTargetMonth}
          submitLabel={submitLabel}
        />
      </DialogContent>
    </Dialog>
  )
}
