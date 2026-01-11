'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { YearlyGoal } from '@/lib/types/yearly-goal'

interface YearlyGoalsSectionProps {
  goals: YearlyGoal[]
  onCreateClick: () => void
  onEditClick: (goal: YearlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: YearlyGoal) => void
}

export const YearlyGoalsSection = ({
  goals,
  onCreateClick,
  onEditClick,
  onDeleteClick,
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
                <CardTitle className="text-black dark:text-black line-clamp-2 break-words">
                  {goal.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {goal.targetDate && (
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground min-w-[3rem]">期限</span>
                      <span className="text-black dark:text-black">
                        {new Date(goal.targetDate).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
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
