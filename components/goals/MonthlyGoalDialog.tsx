'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { MonthlyGoalForm } from './MonthlyGoalForm'
import type { MonthlyGoal, CreateMonthlyGoalInput } from '@/lib/types/monthly-goal'

interface MonthlyGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateMonthlyGoalInput) => Promise<void>
  goal?: MonthlyGoal
  selectedYear?: number
}

export const MonthlyGoalDialog = ({
  open,
  onOpenChange,
  onSubmit,
  goal,
  selectedYear,
}: MonthlyGoalDialogProps) => {
  return (
    <FormDialog<
      CreateMonthlyGoalInput,
      MonthlyGoal,
      { selectedYear?: number }
    >
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={goal}
      title={{
        create: '新しい月間目標を作成',
        edit: '月間目標を編集',
      }}
      formComponent={MonthlyGoalForm}
      formProps={{ selectedYear }}
      closeOnSubmit={true}
    />
  )
}
