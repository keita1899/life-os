'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Transaction } from '../types/transaction'
import type { TransactionCategory } from '../types/transaction-category'

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#a855f7',
]

interface ExpensePieChartProps {
  transactions: Transaction[]
  expenseCategories: TransactionCategory[]
}

export function ExpensePieChart({
  transactions,
  expenseCategories,
}: ExpensePieChartProps) {
  const data = useMemo(() => {
    const categoryMap = new Map<number | null, number>()

    for (const t of transactions) {
      if (t.type !== 'expense') continue
      const current = categoryMap.get(t.categoryId) ?? 0
      categoryMap.set(t.categoryId, current + t.amount)
    }

    const categoryNameMap = new Map<number, string>()
    for (const cat of expenseCategories) {
      categoryNameMap.set(cat.id, cat.name)
    }

    return Array.from(categoryMap.entries())
      .map(([categoryId, value]) => ({
        name:
          categoryId !== null
            ? (categoryNameMap.get(categoryId) ?? '未分類')
            : '未分類',
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, expenseCategories])

  const totalExpense = data.reduce((sum, d) => sum + d.value, 0)

  if (totalExpense === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
        支出データなし
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `${Number(value).toLocaleString()}円`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
