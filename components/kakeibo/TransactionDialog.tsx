'use client'

import { FormDialog } from '@/components/ui/form-dialog'
import { TransactionForm } from './TransactionForm'

interface TransactionData {
  date: string
  type: 'income' | 'expense'
  name: string
  amount: number
  categoryId?: number | null
  isFixed: boolean
}

import type { Transaction, CreateTransactionInput } from '@/lib/types/transaction'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateTransactionInput) => Promise<void>
  transaction?: Transaction
}

export const TransactionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  transaction,
}: TransactionDialogProps) => {
  return (
    <FormDialog<CreateTransactionInput, Transaction>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={transaction}
      title={{
        create: '新しい取引を追加',
        edit: '取引を編集',
      }}
      formComponent={TransactionForm}
      closeOnSubmit={true}
    />
  )
}
