'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { HabitForm } from './HabitForm'
import type { Habit, CreateHabitInput } from '@/lib/types/habit'

interface HabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateHabitInput) => Promise<void>
  habit?: Habit
}

export function HabitDialog({
  open,
  onOpenChange,
  onSubmit,
  habit,
}: HabitDialogProps) {
  return (
    <FormDialog<CreateHabitInput, Habit>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={habit}
      title={{
        create: '新しい習慣を作成',
        edit: '習慣を編集',
      }}
      formComponent={HabitForm}
      closeOnSubmit
    />
  )
}
