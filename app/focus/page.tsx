'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useTasks } from '@/hooks/useTasks'
import { useMode } from '@/lib/contexts/ModeContext'
import { getTodayTasks } from '@/lib/tasks/utils'
import type { Task } from '@/lib/types/task'

export default function FocusPage() {
  const { mode } = useMode()
  const router = useRouter()
  const { tasks, isLoading, error } = useTasks()

  const todayTasks = useMemo(() => getTodayTasks(tasks), [tasks])
  const [focusTaskIds, setFocusTaskIds] = useState<Set<number>>(new Set())

  if (mode !== 'life') {
    return null
  }

  const handleBack = () => {
    router.back()
  }

  const handleToggleTask = (taskId: number) => {
    setFocusTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const handleRemoveFromFocus = (taskId: number) => {
    setFocusTaskIds((prev) => {
      const next = new Set(prev)
      next.delete(taskId)
      return next
    })
  }

  const focusTasks = useMemo(() => {
    return todayTasks.filter((task) => focusTaskIds.has(task.id))
  }, [todayTasks, focusTaskIds])

  const availableTasks = useMemo(() => {
    return todayTasks.filter((task) => !focusTaskIds.has(task.id))
  }, [todayTasks, focusTaskIds])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <h1 className="text-3xl font-bold">フォーカスモード</h1>
        </div>

        <ErrorMessage message={error || ''} />

        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="text-lg font-semibold">
                今日のタスク ({availableTasks.length}件)
              </div>
              {availableTasks.length === 0 ? (
                <div className="text-muted-foreground">
                  すべてのタスクがフォーカスリストに追加されています
                </div>
              ) : (
                <div className="space-y-2">
                  {availableTasks.map((task: Task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border border-stone-200 bg-card p-4 dark:border-stone-800"
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleTask(task.id)}
                        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex-1 font-medium">{task.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="text-lg font-semibold">
                フォーカスタスク ({focusTasks.length}件)
              </div>
              {focusTasks.length === 0 ? (
                <div className="text-muted-foreground">
                  フォーカスタスクが選択されていません
                </div>
              ) : (
                <div className="space-y-2">
                  {focusTasks.map((task: Task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-4 dark:border-primary dark:bg-primary/10"
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleTask(task.id)}
                        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex-1 font-medium">{task.title}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromFocus(task.id)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
