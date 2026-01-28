'use client'

import { useState, useMemo, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useMode } from '@/lib/contexts/ModeContext'
import { Button } from '@/components/ui/button'
import { TransactionDialog } from '@/components/kakeibo/TransactionDialog'
import { TransactionList } from '@/components/kakeibo/TransactionList'
import { ErrorMessage } from '@/components/ui/error-message'
import { Loading } from '@/components/ui/loading'
import { PeriodSummary } from '@/components/kakeibo/PeriodSummary'
import { PeriodSelector } from '@/components/kakeibo/PeriodSelector'
import { TransactionTypeFilter } from '@/components/kakeibo/TransactionTypeFilter'
import { CategoryFilter } from '@/components/kakeibo/CategoryFilter'
import { useTransactions, useTransactionsByMonth, useTransactionsByDateRange } from '@/hooks/useTransactions'
import { useTransactionCategories } from '@/hooks/useTransactionCategories'
import { useUserSettings } from '@/hooks/useUserSettings'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { InitialBalanceDialog } from '@/components/kakeibo/InitialBalanceDialog'
import { getPeriodRange, type PeriodType } from '@/lib/transactions/period'
import { mutate } from 'swr'
import type { Transaction } from '@/lib/types/transaction'
import type { CreateTransactionInput } from '@/lib/types/transaction'

export default function KakeiboPage() {
  const { mode } = useMode()
  const [periodType, setPeriodType] = useState<PeriodType>('thisMonth')
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  )
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString(),
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >(undefined)
  const [deletingTransaction, setDeletingTransaction] = useState<
    Transaction | undefined
  >(undefined)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<
    'all' | 'income' | 'expense' | 'fixed' | 'variable'
  >('all')
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all')

  const periodRange = useMemo(() => {
    return getPeriodRange(
      periodType,
      periodType === 'custom' ? Number(selectedYear) : undefined,
      periodType === 'custom' ? Number(selectedMonth) : undefined,
    )
  }, [periodType, selectedYear, selectedMonth])

  const { transactions: transactionsByMonth, isLoading: isLoadingByMonth } =
    useTransactionsByMonth(
      periodType === 'custom' ? Number(selectedYear) : new Date().getFullYear(),
      periodType === 'custom' ? Number(selectedMonth) : new Date().getMonth() + 1,
    )

  const { transactions: transactionsByRange, isLoading: isLoadingByRange } =
    useTransactionsByDateRange(periodRange.startDate, periodRange.endDate)

  const transactions = useMemo(() => {
    if (periodType === 'custom') {
      return transactionsByMonth
    }
    return transactionsByRange
  }, [periodType, transactionsByMonth, transactionsByRange])

  const isLoading = periodType === 'custom' ? isLoadingByMonth : isLoadingByRange
  const {
    transactions: allTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
  } = useTransactions()

  const incomeCategories = useTransactionCategories('income')
  const expenseCategories = useTransactionCategories('expense')
  const { userSettings, updateUserSettings, refreshUserSettings } = useUserSettings()

  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    if (filterType === 'income') {
      filtered = filtered.filter((t) => t.type === 'income')
    } else if (filterType === 'expense') {
      filtered = filtered.filter((t) => t.type === 'expense')
    } else if (filterType === 'fixed') {
      filtered = filtered.filter((t) => t.type === 'expense' && t.isFixed)
    } else if (filterType === 'variable') {
      filtered = filtered.filter((t) => t.type === 'expense' && !t.isFixed)
    }

    if (filterCategoryId !== 'all') {
      if (filterCategoryId === 'none') {
        filtered = filtered.filter((t) => t.categoryId === null)
      } else {
        const categoryIdNum = Number(filterCategoryId)
        filtered = filtered.filter((t) => t.categoryId === categoryIdNum)
      }
    }

    return filtered
  }, [transactions, filterType, filterCategoryId])

  const periodSummary = useMemo(() => {
    const previousTransactions = allTransactions.filter((t) => {
      return t.date < periodRange.startDate
    })

    const periodTransactions = transactions

    const initialBalance = userSettings?.initialBalance ?? 0
    const beginningBalance =
      initialBalance +
      previousTransactions.reduce((sum, t) => {
        return sum + (t.type === 'income' ? t.amount : -t.amount)
      }, 0)

    const periodIncome = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const fixedExpense = periodTransactions
      .filter((t) => t.type === 'expense' && t.isFixed)
      .reduce((sum, t) => sum + t.amount, 0)

    const variableExpense = periodTransactions
      .filter((t) => t.type === 'expense' && !t.isFixed)
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = fixedExpense + variableExpense
    const endingBalance = beginningBalance + periodIncome - totalExpense

    return {
      beginningBalance,
      endingBalance,
      periodIncome,
      fixedExpense,
      variableExpense,
      totalExpense,
    }
  }, [allTransactions, transactions, periodRange.startDate, userSettings])

  useEffect(() => {
    setFilterCategoryId('all')
  }, [filterType])

  const balanceLabel = useMemo(() => {
    switch (periodType) {
      case 'today':
        return { start: '開始時残高', end: '終了時残高' }
      case 'thisWeek':
        return { start: '週初残高', end: '週末残高' }
      case 'thisMonth':
      case 'lastMonth':
      case 'custom':
        return { start: '月初残高', end: '月末残高' }
      case 'thisYear':
        return { start: '年初残高', end: '年末残高' }
      default:
        return { start: '期間開始時残高', end: '期間終了時残高' }
    }
  }, [periodType])

  if (mode !== 'life') {
    return null
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleCreateTransaction = async (input: CreateTransactionInput) => {
    try {
      setOperationError(null)
      await createTransaction(input)
      await refreshTransactions()
      await mutate(`transactions-${selectedYear}-${selectedMonth}`)
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Failed to create transaction:', err)
      setOperationError(
        err instanceof Error ? err.message : '取引の作成に失敗しました',
      )
    }
  }

  const handleUpdateTransaction = async (input: CreateTransactionInput) => {
    if (!editingTransaction) return

    try {
      setOperationError(null)
      await updateTransaction(editingTransaction.id, {
        date: input.date,
        type: input.type,
        name: input.name,
        amount: input.amount,
        categoryId: input.categoryId,
        isFixed: input.isFixed,
      })
      await refreshTransactions()
      await mutate(`transactions-${selectedYear}-${selectedMonth}`)
      await mutate(
        (key) =>
          typeof key === 'string' && key.startsWith('transactions-range-'),
      )
      setIsDialogOpen(false)
      setEditingTransaction(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '取引の更新に失敗しました',
      )
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (transaction: Transaction) => {
    setDeletingTransaction(transaction)
  }

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return

    try {
      setOperationError(null)
      await deleteTransaction(deletingTransaction.id)
      await refreshTransactions()
      await mutate(`transactions-${selectedYear}-${selectedMonth}`)
      await mutate(
        (key) =>
          typeof key === 'string' && key.startsWith('transactions-range-'),
      )
      setDeletingTransaction(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '取引の削除に失敗しました',
      )
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingTransaction(undefined)
      setOperationError(null)
    }
  }

  const shouldShowInitialBalanceDialog = useMemo(() => {
    if (!userSettings) return false
    return (
      userSettings.initialBalance === null &&
      allTransactions.length === 0
    )
  }, [userSettings, allTransactions.length])

  const handleInitialBalanceConfirm = async (balance: number) => {
    await updateUserSettings({ initialBalance: balance })
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">家計簿</h1>
        </div>

        <ErrorMessage
          message={operationError || ''}
          onDismiss={operationError ? () => setOperationError(null) : undefined}
        />

        <PeriodSelector
          periodType={periodType}
          onPeriodTypeChange={setPeriodType}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          years={years}
          months={months}
        />

        <PeriodSummary
          periodLabel={periodRange.label}
          periodIncome={periodSummary.periodIncome}
          fixedExpense={periodSummary.fixedExpense}
          variableExpense={periodSummary.variableExpense}
          totalExpense={periodSummary.totalExpense}
          beginningBalance={periodSummary.beginningBalance}
          endingBalance={periodSummary.endingBalance}
          balanceLabelStart={balanceLabel.start}
          balanceLabelEnd={balanceLabel.end}
        />

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            取引一覧（{filteredTransactions.length}件）
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            取引を追加
          </Button>
        </div>

        <div className="mb-4">
          <TransactionTypeFilter
            filterType={filterType}
            onFilterTypeChange={(type) => {
              setFilterType(type)
              setFilterCategoryId('all')
            }}
          />
          <CategoryFilter
            filterType={filterType}
            filterCategoryId={filterCategoryId}
            onCategoryChange={setFilterCategoryId}
            incomeCategories={incomeCategories.categories}
            expenseCategories={expenseCategories.categories}
          />
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          {isLoading ? (
            <Loading />
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteClick}
            />
          )}
        </div>

        <TransactionDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSubmit={
            editingTransaction ? handleUpdateTransaction : handleCreateTransaction
          }
          transaction={editingTransaction}
        />

        <DeleteConfirmDialog
          open={!!deletingTransaction}
          message={`「${deletingTransaction?.name}」を削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteTransaction}
          onCancel={() => setDeletingTransaction(undefined)}
        />

        <InitialBalanceDialog
          open={shouldShowInitialBalanceDialog}
          onOpenChange={() => {}}
          onConfirm={handleInitialBalanceConfirm}
        />
      </div>
    </MainLayout>
  )
}
