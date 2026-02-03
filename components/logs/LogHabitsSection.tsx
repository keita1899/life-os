'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatHabitScheduledTime } from '@/lib/habits'
import type { Habit } from '@/lib/types/habit'

interface LogHabitsSectionProps {
  habits: Habit[]
  completedHabitIds: Set<number>
  onToggle: (habit: Habit) => void
}

export function LogHabitsSection({
  habits,
  completedHabitIds,
  onToggle,
}: LogHabitsSectionProps) {
  if (habits.length === 0) {
    return null
  }

  return (
    <Card className="border-stone-200/60 dark:border-stone-700/40">
      <CardHeader>
        <CardTitle className="text-lg">今日の習慣</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {habits.map((habit) => {
            const completed = completedHabitIds.has(habit.id)
            const timeStr = formatHabitScheduledTime(habit.scheduledTime)
            const label = timeStr ? `${timeStr} ${habit.name}` : habit.name
            return (
              <Button
                key={habit.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onToggle(habit)}
                className={cn(
                  'h-auto min-w-0 py-2 px-3 text-left font-normal',
                  completed &&
                    'line-through border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-400',
                )}
              >
                {label}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
