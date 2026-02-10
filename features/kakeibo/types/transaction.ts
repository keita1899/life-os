export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: number
  date: string
  type: TransactionType
  name: string
  amount: number
  categoryId: number | null
  isFixed: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionInput {
  date: string
  type: TransactionType
  name: string
  amount: number
  categoryId?: number | null
  isFixed: boolean
}

export interface UpdateTransactionInput {
  date?: string
  type?: TransactionType
  name?: string
  amount?: number
  categoryId?: number | null
  isFixed?: boolean
}
