'use client'

import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { CalendarViewBase } from './CalendarViewBase'
import { MonthlyGoalCalendarForm } from '@/components/dev/goals/MonthlyGoalCalendarForm'
import { WeeklyGoalForm } from '@/components/dev/goals/WeeklyGoalForm'
import { useDevGoals } from '@/hooks/useDevGoals'
import { useDevCalendarTasks } from '@/hooks/useDevCalendarTasks'
import { useDevProjects } from '@/hooks/useDevProjects'
import { useCalendarView } from '@/hooks/useCalendarView'
import { useMemo } from 'react'
import type { Task } from '@/lib/types/task'

interface DevCalendarViewProps {
  initialDate?: Date
}

export function DevCalendarView({ initialDate }: DevCalendarViewProps) {
  const {
    currentDate,
    viewMode,
    setViewMode,
    weekStartDay,
    isLoadingSettings,
    handlePrev,
    handleNext,
    displayTitle,
  } = useCalendarView({ initialDate })

  const currentYear = currentDate.getFullYear()
  const {
    monthlyGoals,
    weeklyGoals,
    isLoading: isLoadingGoals,
  } = useDevGoals(currentYear)

  const {
    tasks: devTasks,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useDevCalendarTasks()
  const {
    projects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useDevProjects()

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const calendarTasks: Task[] = useMemo(() => {
    return devTasks
      .filter((t) => t.executionDate !== null)
      .map((t) => {
        const prefix = t.projectId
          ? projectNameById.get(t.projectId) ?? `プロジェクト#${t.projectId}`
          : t.type === 'learning'
            ? '学習'
            : 'Inbox'

        return {
          id: t.id,
          title: `${prefix}: ${t.title}`,
          executionDate: t.executionDate,
          completed: t.completed,
          order: t.order,
          actualTime: t.actualTime,
          estimatedTime: t.estimatedTime,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }
      })
  }, [devTasks, projectNameById])

  const isLoading =
    isLoadingGoals || isLoadingTasks || isLoadingProjects || isLoadingSettings

  return (
    <CalendarViewBase
      displayTitle={displayTitle}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onPrev={handlePrev}
      onNext={handleNext}
      isLoading={isLoading}
    >
      {(tasksError || projectsError) && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {tasksError || projectsError}
        </div>
      )}
      {viewMode === 'month' && (
        <MonthlyGoalCalendarForm
          currentDate={currentDate}
          monthlyGoals={monthlyGoals}
        />
      )}
      {viewMode === 'week' && (
        <WeeklyGoalForm
          currentDate={currentDate}
          weeklyGoals={weeklyGoals}
          weekStartDay={weekStartDay}
        />
      )}
      {viewMode === 'month' ? (
        <MonthView
          currentDate={currentDate}
          monthlyGoals={monthlyGoals}
          events={[]}
          tasks={calendarTasks}
          weekStartDay={weekStartDay}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          monthlyGoals={monthlyGoals}
          weeklyGoals={weeklyGoals}
          events={[]}
          tasks={calendarTasks}
          weekStartDay={weekStartDay}
        />
      )}
    </CalendarViewBase>
  )
}
