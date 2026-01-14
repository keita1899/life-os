'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useTasks } from '@/hooks/useTasks'
import { useMode } from '@/lib/contexts/ModeContext'
import type { CreateTaskInput, Task } from '@/lib/types/task'

type TaskGroup = {
  key: string
  title: string
  tasks: Task[]
}

export default function TasksPage() {
  const { mode } = useMode()
  const { tasks, isLoading, error, createTask } = useTasks()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  if (mode !== 'life') {
    return null
  }

  const groupedTasks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayStr = format(today, 'yyyy-MM-dd')
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')

    const groups: TaskGroup[] = [
      { key: 'none', title: '日付なし', tasks: [] },
      { key: 'today', title: '今日', tasks: [] },
      { key: 'tomorrow', title: '明日', tasks: [] },
    ]

    const overdueGroup: TaskGroup = {
      key: 'overdue',
      title: '期限切れ',
      tasks: [],
    }
    const dateGroups = new Map<string, Task[]>()

    tasks.forEach((task) => {
      if (!task.executionDate) {
        groups[0].tasks.push(task)
        return
      }

      const taskDateStr = task.executionDate
      if (taskDateStr === todayStr) {
        groups[1].tasks.push(task)
      } else if (taskDateStr === tomorrowStr) {
        groups[2].tasks.push(task)
      } else {
        const taskDate = parseISO(taskDateStr)
        taskDate.setHours(0, 0, 0, 0)
        if (taskDate < today) {
          overdueGroup.tasks.push(task)
        } else {
          if (!dateGroups.has(taskDateStr)) {
            dateGroups.set(taskDateStr, [])
          }
          dateGroups.get(taskDateStr)!.push(task)
        }
      }
    })

    const sortedDateGroups = Array.from(dateGroups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, tasks]) => ({
        key: dateStr,
        title: format(parseISO(dateStr), 'yyyy年M月d日(E)', { locale: ja }),
        tasks,
      }))

    const filteredGroups = groups.filter((g) => g.tasks.length > 0)
    const result = filteredGroups.concat(sortedDateGroups)

    if (overdueGroup.tasks.length > 0) {
      result.push(overdueGroup)
    }

    return result
  }, [tasks])

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      setCreateError(null)
      await createTask(input)
      setIsDialogOpen(false)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'タスクの作成に失敗しました',
      )
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← ホームに戻る
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">タスク管理</h1>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>タスクを作成</Button>
        </div>
      </div>

      <ErrorMessage
        message={createError || error || ''}
        onDismiss={createError ? () => setCreateError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : groupedTasks.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
          <p className="text-muted-foreground">タスクがありません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedTasks.map((group) => (
            <div key={group.key}>
              <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
                {group.title}
              </h2>
              <TaskList tasks={group.tasks} />
            </div>
          ))}
        </div>
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateTask}
      />
    </div>
  )
}
