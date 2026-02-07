'use client'

import { useState } from 'react'
import { Pencil, Trash2, MoreVertical, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Progress } from '@/components/ui/progress'
import { calculateProgress } from '@/lib/goals/checklist'
import type { DevYearlyGoal } from '@/lib/types/dev-yearly-goal'

interface YearlyGoalsSectionProps {
  goals: DevYearlyGoal[]
  onCreateClick: () => void
  onEditClick: (goal: DevYearlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: DevYearlyGoal) => void
  onToggleChecklistItem?: (
    goal: DevYearlyGoal,
    itemId: string,
    completed: boolean,
  ) => void
}

export const YearlyGoalsSection = ({
  goals,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onToggleChecklistItem,
}: YearlyGoalsSectionProps) => {
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set())

  const toggleChecklist = (goalId: number) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(goalId)) {
        next.delete(goalId)
      } else {
        next.add(goalId)
      }
      return next
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between px-6">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          年間目標
        </h2>
        <Button
          variant="outline"
          onClick={onCreateClick}
          size="sm"
          disabled={goals.length > 0}
          className={goals.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          年間目標を作成
        </Button>
      </div>
      {goals.length > 0 ? (
        <div className="flex flex-col gap-6 px-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.checklist)
            const completedCount = goal.checklist.filter(
              (item) => item.completed,
            ).length
            const isExpanded = expandedGoals.has(goal.id)
            const hasChecklist = goal.checklist.length > 0

            return (
              <div
                key={goal.id}
                className="group relative"
              >
                <div className="relative z-10 pr-10">
                  <h3 className="mb-4 text-3xl font-bold leading-tight text-stone-900 dark:text-stone-100 md:text-4xl lg:text-5xl">
                    {goal.title}
                  </h3>
                  {hasChecklist && (
                    <div className="mt-4 space-y-3">
                      <button
                        type="button"
                        onClick={() => toggleChecklist(goal.id)}
                        className="w-full space-y-3 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>進捗: {completedCount} / {goal.checklist.length}</span>
                            <span className="font-semibold">{progress}%</span>
                          </div>
                          <div className="flex-shrink-0 text-muted-foreground">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                        <Progress value={progress} />
                      </button>
                      {isExpanded && (
                        <div className="mt-4 space-y-2">
                          {goal.checklist.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                onToggleChecklistItem?.(goal, item.id, !item.completed)
                              }
                              className="flex w-full items-center gap-2 text-left text-sm text-stone-900 dark:text-stone-100 hover:opacity-80 transition-opacity"
                            >
                              {item.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-stone-400 flex-shrink-0" />
                              )}
                              <span
                                className={
                                  item.completed
                                    ? 'text-muted-foreground line-through'
                                    : ''
                                }
                              >
                                {item.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="absolute right-0 top-0 z-20 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">メニュー</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditClick(goal)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>編集</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => onDeleteClick(e, goal)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>削除</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="px-6">
          <EmptyState message="年間目標はありません" />
        </div>
      )}
    </div>
  )
}
