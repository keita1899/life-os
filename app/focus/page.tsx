'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
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

  if (mode !== 'life') {
    return null
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-8 px-4">
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
          <div className="space-y-4">
            <div className="text-lg font-semibold">
              今日のタスク ({todayTasks.length}件)
            </div>
            {todayTasks.length === 0 ? (
              <div className="text-muted-foreground">
                今日のタスクはありません
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-stone-200 bg-card p-4 dark:border-stone-800"
                  >
                    <div className="font-medium">{task.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
