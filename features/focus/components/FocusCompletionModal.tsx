'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TaskLike {
  id: number
  title: string
}

interface FocusCompletionModalProps<T extends TaskLike> {
  open: boolean
  onOpenChange: (open: boolean) => void
  completedTasks: Array<{ task: T; timeMinutes: number }>
  totalTimeMinutes: number
  onClose: () => void
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}時間${mins}分`
  }
  return `${mins}分`
}

export function FocusCompletionModal<T extends TaskLike>({
  open,
  onOpenChange,
  completedTasks,
  totalTimeMinutes,
  onClose,
}: FocusCompletionModalProps<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>以下のタスクを完了しました</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            {completedTasks.map((item, index) => (
              <div
                key={item.task.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <span className="font-medium">{item.task.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatTime(item.timeMinutes)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">合計</span>
              <span className="font-semibold">{formatTime(totalTimeMinutes)}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>閉じる</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
