'use client'

import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { YearlyGoal } from '@/lib/types/yearly-goal'

interface YearlyGoalsSectionProps {
  goals: YearlyGoal[]
  onCreateClick: () => void
  onEditClick: (goal: YearlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: YearlyGoal) => void
  onToggleAchievement?: (goal: YearlyGoal) => void
}

export const YearlyGoalsSection = ({
  goals,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onToggleAchievement,
}: YearlyGoalsSectionProps) => {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/30 p-6 dark:border-zinc-800 dark:bg-zinc-950/30">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          年間目標
        </h2>
        <Button onClick={onCreateClick} size="sm">
          年間目標を作成
        </Button>
      </div>
      {goals.length > 0 ? (
        <div className="flex flex-col gap-4">
          {goals.map((goal) => (
            <Card
              key={goal.id}
              className="group relative bg-white border-zinc-200 dark:bg-white dark:border-zinc-200"
            >
              <CardHeader className="pr-20">
                <div className="flex items-start gap-3">
                  {onToggleAchievement && (
                    <button
                      type="button"
                      onClick={() => onToggleAchievement(goal)}
                      aria-label={`${goal.achieved ? '未達成にする' : '達成にする'}: ${goal.title}`}
                      aria-pressed={goal.achieved}
                      className="mt-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 focus:outline-none"
                    >
                      {goal.achieved ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-stone-400" />
                      )}
                    </button>
                  )}
                  <CardTitle
                    className={cn(
                      'text-black dark:text-black line-clamp-2 break-words flex-1',
                      goal.achieved && 'line-through text-stone-500 dark:text-stone-400',
                    )}
                  >
                    {goal.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                </div>
              </CardContent>
              <div className="absolute right-4 top-4 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditClick(goal)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">編集</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => onDeleteClick(e, goal)}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 z-10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">削除</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4">
          年間目標はありません
        </p>
      )}
    </div>
  )
}
