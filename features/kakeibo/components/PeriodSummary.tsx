'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PeriodSummaryProps {
  periodLabel: string
  periodIncome: number
  fixedExpense: number
  variableExpense: number
  totalExpense: number
}

export function PeriodSummary({
  periodLabel,
  periodIncome,
  fixedExpense,
  variableExpense,
  totalExpense,
}: PeriodSummaryProps) {
  const periodBalance = periodIncome - totalExpense
  const expenseRatio =
    periodIncome > 0 ? (totalExpense / periodIncome) * 100 : 0
  const savingsRatio = periodIncome > 0 ? Math.max(0, 100 - expenseRatio) : 0
  const fixedRatio =
    periodIncome > 0 ? (fixedExpense / periodIncome) * 100 : 0
  const variableRatio =
    periodIncome > 0 ? (variableExpense / periodIncome) * 100 : 0

  const cappedFixedRatio = Math.min(fixedRatio, 100)
  const cappedVariableRatio = Math.min(
    variableRatio,
    100 - cappedFixedRatio,
  )
  const cappedSavingsRatio = Math.max(
    0,
    100 - cappedFixedRatio - cappedVariableRatio,
  )

  return (
    <div className="mb-6 rounded-lg border border-stone-200 p-6 dark:border-stone-800">
      <div className="text-sm text-muted-foreground">{periodLabel}</div>

      {/* ヒーロー: 期間収支 */}
      <div className="mt-1 flex items-baseline gap-2">
        <div
          className={`text-4xl font-bold tracking-tight ${
            periodBalance > 0
              ? 'text-green-600 dark:text-green-400'
              : periodBalance < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-foreground'
          }`}
        >
          {(periodBalance >= 0 ? '+' : '') + periodBalance.toLocaleString()}
          円
        </div>
        {periodBalance > 0 && (
          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
        )}
        {periodBalance < 0 && (
          <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
        )}
        {periodBalance === 0 && (
          <Minus className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* 内訳 */}
      <div className="mt-4 flex gap-6">
        <div>
          <div className="text-xs text-muted-foreground">収入</div>
          <div className="text-base font-semibold text-green-600 dark:text-green-400">
            {periodIncome.toLocaleString()}円
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">固定支出</div>
          <div className="text-base font-semibold text-red-600 dark:text-red-400">
            {fixedExpense.toLocaleString()}円
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">変動支出</div>
          <div className="text-base font-semibold text-orange-600 dark:text-orange-400">
            {variableExpense.toLocaleString()}円
          </div>
        </div>
      </div>

      {/* 支出率バー */}
      {periodIncome > 0 && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              支出率{' '}
              <span
                className={
                  expenseRatio > 100
                    ? 'font-medium text-red-600 dark:text-red-400'
                    : ''
                }
              >
                {expenseRatio.toFixed(1)}%
              </span>
            </span>
            {savingsRatio > 0 && (
              <span className="font-medium text-green-600 dark:text-green-400">
                貯蓄率 {savingsRatio.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <div className="flex h-full">
              <div
                className="bg-red-500 transition-all dark:bg-red-600"
                style={{ width: `${cappedFixedRatio}%` }}
              />
              <div
                className="bg-orange-400 transition-all dark:bg-orange-500"
                style={{ width: `${cappedVariableRatio}%` }}
              />
              {cappedSavingsRatio > 0 && (
                <div
                  className="bg-green-200 transition-all dark:bg-green-900/50"
                  style={{ width: `${cappedSavingsRatio}%` }}
                />
              )}
            </div>
          </div>
          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 dark:bg-red-600" />
              固定 {fixedRatio.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-400 dark:bg-orange-500" />
              変動 {variableRatio.toFixed(1)}%
            </span>
            {savingsRatio > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-200 dark:bg-green-900/50" />
                貯蓄
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
