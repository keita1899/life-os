'use client'

import { useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loading } from '@/components/ui/loading'
import {
  useDevTasks,
  useDevCalendarTasks,
  updateDevTask,
  getTodayDevTasks,
} from '@/features/dev/tasks'
import { mutate } from 'swr'
import { FocusView } from '@/features/focus'
import {
  SortableDevTaskItem,
  DraggableAvailableDevTaskItem,
} from '@/features/dev/focus'
import type { DevTask } from '@/features/dev/tasks'

function DevFocusPageContent() {
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('projectId')
  const source = searchParams.get('source')
  const projectId = projectIdParam ? Number(projectIdParam) : null
  const validProjectId = projectId !== null && Number.isFinite(projectId) ? projectId : null
  const [activeType, setActiveType] = useState<'inbox' | 'learning'>('inbox')

  const useProjectTasks = validProjectId !== null
  const useTaskListMode = !useProjectTasks && source === 'tasks'

  const devTasksResult = useDevTasks({
    projectId: useProjectTasks ? validProjectId! : useTaskListMode ? null : undefined,
    type: useTaskListMode ? activeType : undefined,
  })
  const calendarTasksResult = useDevCalendarTasks()

  const tasks = useProjectTasks
    ? devTasksResult.tasks
    : useTaskListMode
      ? devTasksResult.tasks
      : calendarTasksResult.tasks
  const isLoading = useProjectTasks
    ? devTasksResult.isLoading
    : useTaskListMode
      ? devTasksResult.isLoading
      : calendarTasksResult.isLoading
  const error = useProjectTasks
    ? devTasksResult.error
    : useTaskListMode
      ? devTasksResult.error
      : calendarTasksResult.error
  const updateTask = useProjectTasks
    ? devTasksResult.updateTask
    : useTaskListMode
      ? devTasksResult.updateTask
      : async (id: number, input: { completed?: boolean; actualTime?: number }) => {
          await updateDevTask(id, input)
          await mutate('dev-calendar-tasks')
        }

  const todayTasks = useMemo(() => getTodayDevTasks(tasks), [tasks])

  const headerContent = useTaskListMode ? (
    <div className="mb-4">
      <Tabs
        value={activeType}
        onValueChange={(value) => {
          if (value === 'inbox' || value === 'learning') {
            setActiveType(value)
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="learning">学習</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  ) : undefined

  return (
    <FocusView<DevTask>
      tasks={todayTasks}
      isLoading={isLoading}
      error={error}
      onCompleteTask={async (taskId, timeMinutes) => {
        await updateTask(taskId, {
          completed: true,
          actualTime: timeMinutes,
        })
      }}
      renderAvailableItem={(task, onToggle) => (
        <DraggableAvailableDevTaskItem task={task} onToggle={onToggle} />
      )}
      renderFocusItem={(task, index, onToggle, onRemove) => (
        <SortableDevTaskItem
          task={task}
          index={index}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      )}
      headerContent={headerContent}
    />
  )
}

export default function DevFocusPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DevFocusPageContent />
    </Suspense>
  )
}
