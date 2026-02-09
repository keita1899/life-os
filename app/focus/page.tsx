'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useTasks } from '@/hooks/useTasks'
import { getTodayTasks } from '@/lib/tasks/utils'
import { EmptyListDroppable, InvisibleDroppable, FocusListContainer } from '@/components/focus/FocusDroppable'
import { SortableTaskItem, DraggableAvailableTaskItem } from '@/components/focus/LifeFocusTaskItems'
import { FocusSession } from '@/components/focus/FocusSession'
import { FocusCompletionModal } from '@/components/focus/FocusCompletionModal'
import { useFocusTasks } from '@/hooks/useFocusTasks'
import { useFocusDragAndDrop } from '@/hooks/useFocusDragAndDrop'
import { useFocusSession } from '@/hooks/useFocusSession'
import { useSessionHistory } from '@/hooks/useSessionHistory'
import type { Task } from '@/lib/types/task'

export default function FocusPage() {
  const router = useRouter()
  const { tasks, isLoading, error, updateTask } = useTasks()

  const todayTasks = useMemo(() => getTodayTasks(tasks), [tasks])

  const {
    focusTaskIds,
    availableTaskIds,
    focusTasks,
    availableTasks,
    toggleTask,
    removeFromFocus,
    moveTaskToFocus,
    moveTaskToAvailable,
    reorderFocusTasks,
    reorderAvailableTasks,
  } = useFocusTasks({ allTasks: todayTasks })

  const {
    activeId,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useFocusDragAndDrop({
    focusTaskIds,
    availableTaskIds,
    onMoveTaskToFocus: moveTaskToFocus,
    onMoveTaskToAvailable: moveTaskToAvailable,
    onReorderFocusTasks: reorderFocusTasks,
    onReorderAvailableTasks: reorderAvailableTasks,
  })

  const {
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
  } = useFocusSession({
    focusTasks,
    onCompleteTask: async (taskId, timeMinutes) => {
      await updateTask(taskId, { completed: true })
    },
  })

  useSessionHistory(isSessionActive)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const activeTask = useMemo(() => {
    if (activeId === null) return null
    return todayTasks.find((task) => task.id === activeId) || null
  }, [activeId, todayTasks])

  const handleBack = () => {
    router.back()
  }

  if (isSessionActive) {
    return (
      <FocusSession
        formattedTime={stopwatch.formattedTime}
        currentTaskIndex={currentTaskIndex}
        sessionTasks={sessionTasks}
        error={error}
        sessionError={sessionError}
        isCompleting={isCompleting}
        onCompleteTask={completeTask}
      />
    )
  }

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <h1 className="text-3xl font-bold">フォーカスモード</h1>
          </div>
          {focusTasks.length > 0 && (
            <Button onClick={startSession} size="lg">
              <Play className="mr-2 h-4 w-4" />
              スタート
            </Button>
          )}
        </div>

        <ErrorMessage message={error || sessionError || ''} />

        {isLoading ? (
          <Loading />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="text-lg font-semibold">
                    今日のタスク{availableTasks.length > 0 ? ` ${availableTasks.length}件` : ''}
                  </div>
                  {availableTasks.length === 0 ? (
                    <EmptyListDroppable id="available-tasks-list">
                      <div className="text-muted-foreground">
                        すべてのタスクがフォーカスリストに追加されています
                      </div>
                    </EmptyListDroppable>
                  ) : (
                    <SortableContext
                      items={availableTasks.map((task) => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {availableTasks.map((task: Task) => {
                          const showSpacerAbove =
                            activeId !== null &&
                            focusTaskIds.includes(activeId) &&
                            overId === task.id
                          return (
                            <div key={task.id}>
                              {showSpacerAbove && (
                                <div className="mb-2 h-[72px] rounded-lg border-2 border-dashed border-primary bg-primary/5" />
                              )}
                              <DraggableAvailableTaskItem
                                task={task}
                                onToggle={() => toggleTask(task.id)}
                              />
                            </div>
                          )
                        })}
                        {activeId !== null &&
                          focusTaskIds.includes(activeId) &&
                          overId === 'available-tasks-list' && (
                            <div className="mb-2 h-[72px] rounded-lg border-2 border-dashed border-primary bg-primary/5" />
                          )}
                        {activeId !== null &&
                          focusTaskIds.includes(activeId) &&
                          overId === 'available-tasks-list-end' && (
                            <div className="mb-2 h-[72px] rounded-lg border-2 border-dashed border-primary bg-primary/5" />
                          )}
                        <InvisibleDroppable id="available-tasks-list-end">
                          <div className="h-8" />
                        </InvisibleDroppable>
                      </div>
                    </SortableContext>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="text-lg font-semibold">
                    フォーカスタスク{focusTasks.length > 0 ? ` ${focusTasks.length}件` : ''}
                  </div>
                  {focusTasks.length === 0 ? (
                    <EmptyListDroppable id="focus-tasks-list">
                      <div className="text-muted-foreground">
                        フォーカスタスクが選択されていません
                      </div>
                    </EmptyListDroppable>
                  ) : (
                    <FocusListContainer
                      isOver={
                        activeId !== null &&
                        !focusTaskIds.includes(activeId) &&
                        (overId === 'focus-tasks-list-container' ||
                          (typeof overId === 'number' &&
                            focusTaskIds.includes(overId)) ||
                          overId === 'focus-tasks-list-end')
                      }
                      hasItems={focusTasks.length > 0}
                    >
                      <SortableContext
                        items={focusTaskIds}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {focusTasks.map((task: Task, index: number) => {
                            const showSpacerAbove =
                              activeId !== null &&
                              !focusTaskIds.includes(activeId) &&
                              overId === task.id
                            return (
                              <div key={task.id}>
                                {showSpacerAbove && (
                                  <div className="mb-2 h-[72px] rounded-lg border-2 border-dashed border-primary bg-primary/5" />
                                )}
                                <SortableTaskItem
                                  task={task}
                                  index={index}
                                  onToggle={() => toggleTask(task.id)}
                                  onRemove={() => removeFromFocus(task.id)}
                                />
                              </div>
                            )
                          })}
                          {activeId !== null &&
                            !focusTaskIds.includes(activeId) &&
                            overId === 'focus-tasks-list-end' && (
                              <div className="mb-2 h-[72px] rounded-lg border-2 border-dashed border-primary bg-primary/5" />
                            )}
                          <InvisibleDroppable id="focus-tasks-list-end">
                            <div className="h-8" />
                          </InvisibleDroppable>
                        </div>
                      </SortableContext>
                    </FocusListContainer>
                  )}
                </div>
              </div>
            </div>
            <DragOverlay>
              {activeTask && (
                <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-card p-4 shadow-lg dark:border-stone-800">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="checkbox"
                    checked={focusTaskIds.includes(activeTask.id)}
                    readOnly
                    className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex-1 font-medium">{activeTask.title}</div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <FocusCompletionModal
        open={isCompletionModalOpen}
        onOpenChange={handleCompletionModalChange}
        completedTasks={completedTasks}
        totalTimeMinutes={totalTimeMinutes}
        onClose={closeCompletionModal}
      />
    </>
  )
}
