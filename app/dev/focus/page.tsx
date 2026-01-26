'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, X, CheckCircle2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDevTasks } from '@/hooks/useDevTasks'
import { useMode } from '@/lib/contexts/ModeContext'
import { getTodayDevTasks } from '@/lib/tasks/utils'
import { useStopwatch } from '@/components/focus/Stopwatch'
import type { DevTask } from '@/lib/types/dev-task'

export default function DevFocusPage() {
  const { mode } = useMode()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('projectId')
  const projectId = projectIdParam ? Number(projectIdParam) : null
  const [activeType, setActiveType] = useState<'inbox' | 'learning'>('inbox')
  const [focusTaskIds, setFocusTaskIds] = useState<Set<number>>(new Set())

  const {
    tasks,
    isLoading,
    error,
    updateTask,
  } = useDevTasks({
    projectId: projectId !== null && Number.isFinite(projectId) ? projectId : null,
    type: projectId !== null ? undefined : activeType,
  })

  const todayTasks = useMemo(
    () => getTodayDevTasks(tasks),
    [tasks],
  )

  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionTasks, setSessionTasks] = useState<DevTask[]>([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Array<{ task: DevTask; timeMinutes: number }>>([])
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)

  const stopwatch = useStopwatch({
    onTimeUpdate: () => {},
  })

  useEffect(() => {
    if (!isSessionActive) return

    const handlePopState = (e: PopStateEvent) => {
      window.history.pushState(null, '', window.location.href)
      e.preventDefault()
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isSessionActive])

  if (mode !== 'development') {
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

  const handleStartSession = () => {
    if (focusTasks.length === 0) {
      setSessionError('フォーカスタスクを選択してください')
      return
    }
    setSessionTasks([...focusTasks])
    setCurrentTaskIndex(0)
    setCompletedTasks([])
    setIsSessionActive(true)
    setSessionError(null)
    stopwatch.start()
  }

  const handleCompleteTask = async () => {
    if (sessionTasks.length === 0) return

    const currentTask = sessionTasks[currentTaskIndex]
    const elapsedMinutes = Math.floor(stopwatch.elapsedSeconds / 60)

    try {
      setSessionError(null)
      await updateTask(currentTask.id, {
        completed: true,
        actualTime: elapsedMinutes,
      })

      const newCompletedTasks = [...completedTasks, { task: currentTask, timeMinutes: elapsedMinutes }]
      setCompletedTasks(newCompletedTasks)

      if (currentTaskIndex < sessionTasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1)
        stopwatch.reset()
        stopwatch.start()
      } else {
        setIsSessionActive(false)
        stopwatch.reset()
        setIsCompletionModalOpen(true)
      }
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : 'タスクの完了に失敗しました',
      )
    }
  }

  const handleCloseCompletionModal = () => {
    setIsCompletionModalOpen(false)
    setSessionTasks([])
    setCurrentTaskIndex(0)
    setCompletedTasks([])
    router.back()
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins}分`
    }
    return `${mins}分`
  }

  const totalTimeMinutes = useMemo(() => {
    return completedTasks.reduce((sum, item) => sum + item.timeMinutes, 0)
  }, [completedTasks])

  const focusTasks = useMemo(() => {
    return todayTasks.filter((task) => focusTaskIds.has(task.id))
  }, [todayTasks, focusTaskIds])

  const availableTasks = useMemo(() => {
    return todayTasks.filter((task) => !focusTaskIds.has(task.id))
  }, [todayTasks, focusTaskIds])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSessionActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
            )}
            <h1 className="text-3xl font-bold">フォーカスモード</h1>
          </div>
          {!isSessionActive && focusTasks.length > 0 && (
            <Button onClick={handleStartSession} size="lg">
              <Play className="mr-2 h-4 w-4" />
              スタート
            </Button>
          )}
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

        <ErrorMessage message={error || sessionError || ''} />

        {isLoading ? (
          <Loading />
        ) : isSessionActive ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8">
            <div className="text-center">
              <div className="mb-4 text-6xl font-mono font-bold">
                {stopwatch.formattedTime}
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
                <Button onClick={handleCompleteTask} size="lg">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  完了
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
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
                    {availableTasks.map((task: DevTask) => (
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
                    {focusTasks.map((task: DevTask, index: number) => (
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
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            {index + 1}.
                          </span>
                          <div className="flex-1 font-medium">{task.title}</div>
                        </div>
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
          </div>
        )}
      </div>

      <Dialog open={isCompletionModalOpen} onOpenChange={setIsCompletionModalOpen}>
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
              <Button onClick={handleCloseCompletionModal}>閉じる</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
