'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { TransactionCategoryForm } from './TransactionCategoryForm'
import type {
  TransactionCategory,
  CreateTransactionCategoryInput,
} from '@/lib/types/transaction-category'

type TransactionCategoryType = 'income' | 'expense'

interface TransactionCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateTransactionCategoryInput) => Promise<void>
  category?: TransactionCategory
  type: TransactionCategoryType
}

export const TransactionCategoryDialog = ({
  open,
  onOpenChange,
  onSubmit,
  category,
  type,
}: TransactionCategoryDialogProps) => {
  const typeLabel = type === 'income' ? '収入' : '支出'

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={category}
      title={{
        create: `新しい${typeLabel}カテゴリーを作成`,
        edit: `${typeLabel}カテゴリーを編集`,
      }}
      formComponent={TransactionCategoryForm}
    />
  )
}
