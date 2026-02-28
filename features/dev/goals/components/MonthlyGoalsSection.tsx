'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { calculateProgress } from '@/features/goals'
import { InlineEditableText } from '@/components/ui/inline-editable-text'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import type { DevMonthlyGoal } from '../types/dev-monthly-goal'

interface MonthlyGoalsSectionProps {
  goals: DevMonthlyGoal[]
  selectedYear: number
  onCreateClick: (defaultMonth?: number) => void
  onEditClick: (goal: DevMonthlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: DevMonthlyGoal) => void
  onToggleChecklistItem?: (
    goal: DevMonthlyGoal,
    itemId: string,
    completed: boolean,
  ) => void
  onRenameGoal?: (goal: DevMonthlyGoal, title: string) => Promise<void>
}

function MonthlyGoalCard({
  goal,
  onEditClick,
  onDeleteClick,
  onToggleChecklistItem,
  onRenameGoal,
}: {
  goal: DevMonthlyGoal
  onEditClick: (goal: DevMonthlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: DevMonthlyGoal) => void
  onToggleChecklistItem?: (
    goal: DevMonthlyGoal,
    itemId: string,
    completed: boolean,
  ) => void
  onRenameGoal?: (goal: DevMonthlyGoal, title: string) => Promise<void>
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const progress = calculateProgress(goal.checklist)
  const completedCount = goal.checklist.filter((item) => item.completed).length
  const hasChecklist = goal.checklist.length > 0

  return (
    <Card className="group relative border-stone-200 dark:border-stone-800">
      <CardHeader className="pr-20">
        <CardTitle className="mb-3 text-stone-900 dark:text-stone-100 line-clamp-2 break-words">
          <InlineEditableText
            value={goal.title}
            onSave={(title) => onRenameGoal!(goal, title)}
            disabled={!onRenameGoal}
          />
        </CardTitle>
        {hasChecklist && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full space-y-2 text-left"
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
        )}
      </CardHeader>
      {hasChecklist && isExpanded && (
        <CardContent>
          <div className="space-y-2">
            {goal.checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onToggleChecklistItem?.(goal, item.id, !item.completed)
                }
                className="flex w-full items-center gap-2 text-left text-sm hover:opacity-80 transition-opacity"
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
        </CardContent>
      )}
      <div className="absolute right-4 top-4 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
        <EditDeleteDropdownMenu
          onEdit={() => onEditClick(goal)}
          onDelete={(e) => onDeleteClick(e, goal)}
        />
      </div>
    </Card>
  )
}

export const MonthlyGoalsSection = ({
  goals,
  selectedYear,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onToggleChecklistItem,
  onRenameGoal,
}: MonthlyGoalsSectionProps) => {
  const [showAllMonths, setShowAllMonths] = useState(false)
  const currentDate = useMemo(() => new Date(), [])
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const thisMonthGoals = useMemo(() => {
    if (selectedYear !== currentYear) return []
    return goals.filter((goal) => goal.month === currentMonth)
  }, [goals, selectedYear, currentYear, currentMonth])

  const monthlyGoalsByMonth = useMemo(() => {
    const monthly: Record<number, DevMonthlyGoal[]> = {}
    goals.forEach((goal) => {
      if (!monthly[goal.month]) {
        monthly[goal.month] = []
      }
      monthly[goal.month].push(goal)
    })
    return monthly
  }, [goals])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          月間目標
        </h2>
        <Button variant="outline" onClick={() => onCreateClick()} size="sm">
          月間目標を作成
        </Button>
      </div>

      {selectedYear === currentYear && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            今月の目標
          </h3>
          {thisMonthGoals.length === 0 ? (
            <InlineCreateButton
              label="今月の目標を作成"
              onClick={() => onCreateClick(currentMonth)}
            />
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {thisMonthGoals.map((goal) => (
                <MonthlyGoalCard
                  key={goal.id}
                  goal={goal}
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                  onToggleChecklistItem={onToggleChecklistItem}
                  onRenameGoal={onRenameGoal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllMonths((prev) => !prev)}
          className="mb-4 text-muted-foreground"
        >
          {showAllMonths ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              すべての月を非表示
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              すべての月を表示
            </>
          )}
        </Button>
        {showAllMonths && (
          <GroupedAccordion
            items={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
              const monthGoals = monthlyGoalsByMonth[month] || []
              const isCurrentMonth =
                selectedYear === currentYear && month === currentMonth
              return {
                key: `month-${month}`,
                itemClassName: isCurrentMonth
                  ? 'border-stone-300 dark:border-stone-700'
                  : '',
                triggerClassName: isCurrentMonth
                  ? 'text-blue-600 dark:text-blue-400'
                  : '',
                trigger: `${month}月`,
                content:
                  monthGoals.length === 0 ? (
                    <InlineCreateButton
                      label={`${month}月の目標を作成`}
                      onClick={() => onCreateClick(month)}
                    />
                  ) : (
                    <div className="grid gap-4 grid-cols-1">
                      {monthGoals.map((goal) => (
                        <MonthlyGoalCard
                          key={goal.id}
                          goal={goal}
                          onEditClick={onEditClick}
                          onDeleteClick={onDeleteClick}
                          onToggleChecklistItem={onToggleChecklistItem}
                        />
                      ))}
                    </div>
                  ),
              }
            })}
            defaultValue={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) =>
              `month-${m}`,
            )}
          />
        )}
      </div>
    </div>
  )
}
