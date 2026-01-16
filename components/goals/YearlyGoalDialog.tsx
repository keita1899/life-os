'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { YearlyGoalForm } from './YearlyGoalForm'
import type { YearlyGoal, CreateYearlyGoalInput } from '@/lib/types/yearly-goal'

interface YearlyGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateYearlyGoalInput) => Promise<void>
  goal?: YearlyGoal
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
    <FormDialog<CreateYearlyGoalInput, YearlyGoal, { selectedYear?: number }>
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
