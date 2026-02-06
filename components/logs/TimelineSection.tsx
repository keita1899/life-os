'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { TimelineItem, type TimelineItemType } from '@/components/logs/TimelineItem'
import { LogEventsSection } from '@/components/logs/LogEventsSection'
import { LogHabitsSection } from '@/components/logs/LogHabitsSection'
import { LogTasksSection } from '@/components/logs/LogTasksSection'
import type { Event } from '@/lib/types/event'
import type { Habit } from '@/lib/types/habit'
import type { Task } from '@/lib/types/task'

interface TimelineSectionProps {
  items: TimelineItemType[]
  events: Event[]
  habits: Habit[]
  tasks: Task[]
  completedHabitIds: Set<number>
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (event: Event) => void
  onToggleHabit?: (habit: Habit) => void
  onToggleTask?: (task: Task) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
}

export function TimelineSection({
  items,
  events,
  habits,
  tasks,
  completedHabitIds,
  onEditEvent,
  onDeleteEvent,
  onToggleHabit,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: TimelineSectionProps) {
  const [view, setView] = useState<'timeline' | 'sections'>('timeline')

  return (
    <Card className="border-stone-200/60 dark:border-stone-700/40">
      <CardContent className="pt-6">
        <div className="flex justify-center mb-6">
          <div className="flex p-1 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <button
              onClick={() => setView('timeline')}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                ${view === 'timeline' 
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                }
              `}
            >
              タイムライン
            </button>
            <button
              onClick={() => setView('sections')}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                ${view === 'sections' 
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                }
              `}
            >
              セクション
            </button>
          </div>
        </div>
        {view === 'timeline' ? (
          items.length === 0 ? (
            <EmptyState message="予定・習慣・タスクがありません" />
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const key =
                  item.type === 'event'
                    ? `${item.data.id}-${item.data.startDatetime}`
                    : item.type === 'habit'
                      ? `habit-${item.data.id}`
                      : `task-${item.data.id}`
                return (
                  <TimelineItem
                    key={key}
                    item={item}
                    onEditEvent={onEditEvent}
                    onDeleteEvent={onDeleteEvent}
                    onToggleHabit={onToggleHabit}
                    onToggleTask={onToggleTask}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                  />
                )
              })}
            </div>
          )
        ) : (
          <div className="space-y-6">
            <LogEventsSection
              events={events}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
            />
            <LogHabitsSection
              habits={habits}
              completedHabitIds={completedHabitIds}
              onToggle={onToggleHabit}
            />
            <LogTasksSection
              tasks={tasks}
              onToggleCompletion={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
