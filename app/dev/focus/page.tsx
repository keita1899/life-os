'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDevTasks } from '@/hooks/useDevTasks'
import { useMode } from '@/lib/contexts/ModeContext'
import { getTodayDevTasks } from '@/lib/tasks/utils'
import type { DevTask } from '@/lib/types/dev-task'

export default function DevFocusPage() {
  const { mode } = useMode()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('projectId')
  const projectId = projectIdParam ? Number(projectIdParam) : null
  const [activeType, setActiveType] = useState<'inbox' | 'learning'>('inbox')

  const {
    tasks,
    isLoading,
    error,
  } = useDevTasks({
    projectId: projectId !== null && Number.isFinite(projectId) ? projectId : null,
    type: projectId !== null ? undefined : activeType,
  })

  const todayTasks = useMemo(
    () => getTodayDevTasks(tasks),
    [tasks],
  )

  if (mode !== 'development') {
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

        {projectId === null && (
          <div className="mb-4">
            <Tabs value={activeType} onValueChange={(value) => {
              if (value === 'inbox' || value === 'learning') {
                setActiveType(value)
              }
            }}>
              <TabsList>
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="learning">学習</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

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
                {todayTasks.map((task: DevTask) => (
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
