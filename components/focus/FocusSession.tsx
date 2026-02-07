'use client'

import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/ui/error-message'

interface TaskLike {
  title: string
}

interface FocusSessionProps<T extends TaskLike> {
  formattedTime: string
  currentTaskIndex: number
  sessionTasks: T[]
  error: string | null
  sessionError: string | null
  isCompleting: boolean
  onCompleteTask: () => void
}

export function FocusSession<T extends TaskLike>({
  formattedTime,
  currentTaskIndex,
  sessionTasks,
  error,
  sessionError,
  isCompleting,
  onCompleteTask,
}: FocusSessionProps<T>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <ErrorMessage message={error || sessionError || ''} />
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8">
          <div className="text-center">
            <div className="mb-4 text-6xl font-mono font-bold">
              {formattedTime}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentTaskIndex + 1} / {sessionTasks.length}
            </div>
          </div>

          <div className="w-full max-w-2xl space-y-4">
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-8 text-center dark:bg-primary/10">
              <h2 className="text-2xl font-semibold">
                {sessionTasks[currentTaskIndex]?.title}
              </h2>
            </div>

            <div className="flex justify-center">
              <Button onClick={onCompleteTask} size="lg" disabled={isCompleting}>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                完了
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
