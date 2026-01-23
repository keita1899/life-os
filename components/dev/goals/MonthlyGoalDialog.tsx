'use client'

import type { ReactElement } from 'react'
import { FormDialog } from '@/components/ui/form-dialog'
import { MonthlyGoalForm } from './MonthlyGoalForm'
import type {
  DevMonthlyGoal,
  CreateDevMonthlyGoalInput,
} from '@/lib/types/dev-monthly-goal'

interface MonthlyGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateDevMonthlyGoalInput) => Promise<void>
  goal?: DevMonthlyGoal
  selectedYear?: number
}

export const MonthlyGoalDialog = ({
  open,
  onOpenChange,
  onSubmit,
  goal,
  selectedYear,
}: MonthlyGoalDialogProps): ReactElement => {
  return (
    <FormDialog<
      CreateDevMonthlyGoalInput,
      DevMonthlyGoal,
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
