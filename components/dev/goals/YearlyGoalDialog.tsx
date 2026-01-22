'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { YearlyGoalForm } from './YearlyGoalForm'
import type {
  DevYearlyGoal,
  CreateDevYearlyGoalInput,
} from '@/lib/types/dev-yearly-goal'

interface YearlyGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateDevYearlyGoalInput) => Promise<void>
  goal?: DevYearlyGoal
  selectedYear?: number
}

export const YearlyGoalDialog = ({
  open,
  onOpenChange,
  onSubmit,
  goal,
  selectedYear,
}: YearlyGoalDialogProps) => {
  return (
    <FormDialog<CreateDevYearlyGoalInput, DevYearlyGoal, { selectedYear?: number }>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={goal}
      title={{
        create: '新しい年間目標を作成',
        edit: '年間目標を編集',
      }}
      formComponent={YearlyGoalForm}
      formProps={{ selectedYear }}
      closeOnSubmit={true}
    />
  )
}
