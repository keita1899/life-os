'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitItem } from './HabitItem'
import type { Habit } from '@/features/habits'

interface LogHabitsSectionProps {
  habits: Habit[]
  completedHabitIds: Set<number>
  onToggle?: (habit: Habit) => void
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
        <CardTitle className="text-lg">習慣</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {habits.map((habit) => {
            const completed = completedHabitIds.has(habit.id)
            return (
              <HabitItem
                key={habit.id}
                habit={habit}
                completed={completed}
                onToggle={onToggle}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
