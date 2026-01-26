'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X, CheckCircle2, Play, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTasks } from '@/hooks/useTasks'
import { useMode } from '@/lib/contexts/ModeContext'
import { getTodayTasks } from '@/lib/tasks/utils'
import { useStopwatch } from '@/components/focus/Stopwatch'
import type { Task } from '@/lib/types/task'

interface SortableTaskItemProps {
  task: Task
  index: number
  onToggle: () => void
  onRemove: () => void
}

function SortableTaskItem({
  task,
  index,
  onToggle,
  onRemove,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-4 dark:border-primary dark:bg-primary/10"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="checkbox"
        checked={true}
        onChange={onToggle}
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
        onClick={onRemove}
        className="h-8 w-8"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function FocusPage() {
  const { mode } = useMode()
  const router = useRouter()
  const { tasks, isLoading, error, updateTask } = useTasks()

  const todayTasks = useMemo(() => getTodayTasks(tasks), [tasks])
  const [focusTaskIds, setFocusTaskIds] = useState<number[]>([])
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionTasks, setSessionTasks] = useState<Task[]>([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Array<{ task: Task; timeMinutes: number }>>([])
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  if (mode !== 'life') {
    return null
  }

  const handleToggleTask = (taskId: number) => {
    setFocusTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId)
      } else {
        return [...prev, taskId]
      }
    })
  }

  const handleRemoveFromFocus = (taskId: number) => {
    setFocusTaskIds((prev) => prev.filter((id) => id !== taskId))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setFocusTaskIds((items) => {
        const oldIndex = items.indexOf(active.id as number)
        const newIndex = items.indexOf(over.id as number)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const focusTasks = useMemo(() => {
    const taskMap = new Map(todayTasks.map((task) => [task.id, task]))
    return focusTaskIds
      .map((id) => taskMap.get(id))
      .filter((task): task is Task => task !== undefined)
  }, [todayTasks, focusTaskIds])

  const availableTasks = useMemo(() => {
    const focusTaskIdSet = new Set(focusTaskIds)
    return todayTasks.filter((task) => !focusTaskIdSet.has(task.id))
  }, [todayTasks, focusTaskIds])

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

  const handleBack = () => {
    router.back()
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
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={focusTaskIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {focusTasks.map((task: Task, index: number) => (
                          <SortableTaskItem
                            key={task.id}
                            task={task}
                            index={index}
                            onToggle={() => handleToggleTask(task.id)}
                            onRemove={() => handleRemoveFromFocus(task.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
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
