export interface TransactionCategory {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionCategoryInput {
  name: string
}

export interface UpdateTransactionCategoryInput {
  name?: string
}
