import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useStopwatch } from '@/components/focus/Stopwatch'

interface TaskLike {
  id: number
  title: string
}

interface UseFocusSessionOptions<T extends TaskLike> {
  focusTasks: T[]
  onCompleteTask: (taskId: number, timeMinutes: number) => Promise<void>
}

export function useFocusSession<T extends TaskLike>({
  focusTasks,
  onCompleteTask,
}: UseFocusSessionOptions<T>) {
  const router = useRouter()
  const stopwatch = useStopwatch()
  
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionTasks, setSessionTasks] = useState<T[]>([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Array<{ task: T; timeMinutes: number }>>([])
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const totalTimeMinutes = useMemo(() => {
    return completedTasks.reduce((sum, item) => sum + item.timeMinutes, 0)
  }, [completedTasks])

  const startSession = () => {
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

  const completeTask = async () => {
    if (sessionTasks.length === 0) return
    if (isCompleting) return

    setIsCompleting(true)
    const currentTask = sessionTasks[currentTaskIndex]
    const elapsedMinutes = Math.floor(stopwatch.elapsedSeconds / 60)

    try {
      setSessionError(null)
      await onCompleteTask(currentTask.id, elapsedMinutes)

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
    } finally {
      setIsCompleting(false)
    }
  }

  const closeCompletionModal = () => {
    setIsCompletionModalOpen(false)
    setSessionTasks([])
    setCurrentTaskIndex(0)
    setCompletedTasks([])
    router.back()
  }

  const handleCompletionModalChange = (open: boolean) => {
    setIsCompletionModalOpen(open)
    if (!open) {
      setSessionTasks([])
      setCurrentTaskIndex(0)
      setCompletedTasks([])
      router.back()
    }
  }

  return {
    isSessionActive,
    sessionTasks,
    currentTaskIndex,
    sessionError,
    completedTasks,
    isCompletionModalOpen,
    isCompleting,
    totalTimeMinutes,
    stopwatch,
    startSession,
    completeTask,
    closeCompletionModal,
    handleCompletionModalChange,
  }
}
