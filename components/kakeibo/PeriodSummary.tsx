'use client'

interface PeriodSummaryProps {
  periodLabel: string
  periodIncome: number
  fixedExpense: number
  variableExpense: number
  totalExpense: number
  beginningBalance: number
  endingBalance: number
  balanceLabelStart: string
  balanceLabelEnd: string
}

export function PeriodSummary({
  periodLabel,
  periodIncome,
  fixedExpense,
  variableExpense,
  totalExpense,
  beginningBalance,
  endingBalance,
  balanceLabelStart,
  balanceLabelEnd,
}: PeriodSummaryProps) {
  const periodBalance = periodIncome - totalExpense

  return (
    <div className="mb-6 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="text-sm text-muted-foreground">{periodLabel}</div>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <div className="text-sm text-muted-foreground">収入</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {periodIncome.toLocaleString()}円
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">固定支出</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">
            {fixedExpense.toLocaleString()}円
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">変動支出</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">
            {variableExpense.toLocaleString()}円
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">期間収支</div>
          <div
            className={`text-xl font-bold ${
              periodBalance >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {(periodBalance >= 0 ? '+' : '') + periodBalance.toLocaleString()}円
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-stone-200 pt-4 dark:border-stone-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">{balanceLabelStart}</div>
            <div className="text-lg font-semibold">
              {beginningBalance.toLocaleString()}円
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{balanceLabelEnd}</div>
            <div className="text-lg font-semibold">
              {endingBalance.toLocaleString()}円
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
