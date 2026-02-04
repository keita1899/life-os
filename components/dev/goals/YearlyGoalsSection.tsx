'use client'

import { Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { DevYearlyGoal } from '@/lib/types/dev-yearly-goal'

interface YearlyGoalsSectionProps {
  goals: DevYearlyGoal[]
  onCreateClick: () => void
  onEditClick: (goal: DevYearlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: DevYearlyGoal) => void
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
                </div>
              </CardContent>
              <div className="absolute right-4 top-4 z-10 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
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
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message="年間目標はありません" />
      )}
    </div>
  )
}
