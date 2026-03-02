'use client'

import { useState, useMemo } from 'react'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { CreateButton } from '@/components/ui/create-button'
import {
  TransactionDialog,
  TransactionList,
  PeriodSummary,
  PeriodSelector,
  TransactionTypeFilter,
  CategoryFilter,
  InitialBalanceDialog,
  useTransactions,
  useTransactionsByMonth,
  useTransactionsByDateRange,
  useTransactionCategories,
  getPeriodRange,
  type PeriodType,
  type Transaction,
  type CreateTransactionInput,
} from '@/features/kakeibo'
import { ErrorMessage } from '@/components/ui/error-message'
import { Loading } from '@/components/ui/loading'
import { useUserSettings } from '@/features/settings'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { mutate } from 'swr'
import { SWR_KEYS, isTransactionsRelatedKey } from '@/lib/swr-keys'

export default function KakeiboPage() {
  const [periodType, setPeriodType] = useState<PeriodType>('thisMonth')
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  )
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString(),
  )
  const {
    isDialogOpen,
    editingItem: editingTransaction,
    handleEdit: handleEditTransaction,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<Transaction>()
  const deleteConfirm = useDeleteConfirm<Transaction>()
  const { operationError, setOperationError, execute } = useAsyncOperation()
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
  const { userSettings, updateUserSettings } = useUserSettings()

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

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

  const shouldShowInitialBalanceDialog = useMemo(() => {
    if (!userSettings) return false
    return (
      userSettings.initialBalance === null &&
      allTransactions.length === 0
    )
  }, [userSettings, allTransactions.length])

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleCreateTransaction = async (input: CreateTransactionInput) => {
    const result = await execute(async () => {
      const created = await createTransaction(input)
      await refreshTransactions()
      await mutate(SWR_KEYS.transactionsByMonth(Number(selectedYear), Number(selectedMonth)))
      await mutate(isTransactionsRelatedKey)
      return created
    }, '取引の作成に失敗しました')
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleUpdateTransaction = async (input: CreateTransactionInput) => {
    if (!editingTransaction) return

    const result = await execute(async () => {
      const updated = await updateTransaction(editingTransaction.id, {
        date: input.date,
        type: input.type,
        name: input.name,
        amount: input.amount,
        categoryId: input.categoryId,
        isFixed: input.isFixed,
      })
      await refreshTransactions()
      await mutate(SWR_KEYS.transactionsByMonth(Number(selectedYear), Number(selectedMonth)))
      await mutate(isTransactionsRelatedKey)
      return updated
    }, '取引の更新に失敗しました')
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleDeleteTransaction = async () => {
    const transaction = deleteConfirm.deletingItem
    if (!transaction) return

    const result = await execute(async () => {
      await deleteTransaction(transaction.id)
      await refreshTransactions()
      await mutate(SWR_KEYS.transactionsByMonth(Number(selectedYear), Number(selectedMonth)))
      await mutate(isTransactionsRelatedKey)
      return true
    }, '取引の削除に失敗しました')
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleDialogCloseWithErrorClear = (open: boolean) => {
    handleDialogClose(open)
    if (!open) {
      setOperationError(null)
    }
  }

  const handleInitialBalanceConfirm = async (balance: number) => {
    await updateUserSettings({ initialBalance: balance })
  }

  return (
    <>
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
            取引一覧{filteredTransactions.length > 0 ? ` ${filteredTransactions.length}` : ''}
          </div>
          <CreateButton label="取引を作成" onClick={handleCreateClick} />
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

        <div
          className={
            isLoading || filteredTransactions.length === 0
              ? 'rounded-lg border border-stone-200 p-4 dark:border-stone-800'
              : undefined
          }
        >
          {isLoading ? (
            <Loading />
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={deleteConfirm.handleDeleteClick}
            />
          )}
        </div>

        <TransactionDialog
          open={isDialogOpen}
          onOpenChange={handleDialogCloseWithErrorClear}
          onSubmit={
            editingTransaction ? handleUpdateTransaction : handleCreateTransaction
          }
          transaction={editingTransaction}
        />

        <DeleteConfirmDialog
          open={!!deleteConfirm.deletingItem}
          message={`「${deleteConfirm.deletingItem?.name}」を削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteTransaction}
          onCancel={deleteConfirm.handleDeleteCancel}
        />

        <InitialBalanceDialog
          open={shouldShowInitialBalanceDialog}
          onOpenChange={() => {}}
          onConfirm={handleInitialBalanceConfirm}
        />
      </div>
    </>
  )
}
