'use client'

import { useId } from 'react'
import { ArrowRight } from 'lucide-react'

interface BalanceCardProps {
  beginningBalance: number
  endingBalance: number
  balanceLabelStart: string
  balanceLabelEnd: string
}

export function BalanceCard({
  beginningBalance,
  endingBalance,
  balanceLabelStart,
  balanceLabelEnd,
}: BalanceCardProps) {
  const gradientId = useId()
  const diff = endingBalance - beginningBalance
  const changePercent =
    beginningBalance !== 0
      ? ((diff / Math.abs(beginningBalance)) * 100).toFixed(1)
      : null

  const isUp = diff > 0
  const isDown = diff < 0
  const lineColor = isUp
    ? '#22c55e'
    : isDown
      ? '#ef4444'
      : '#a8a29e'

  const startY = isUp ? 34 : isDown ? 6 : 20
  const endY = isUp ? 6 : isDown ? 34 : 20

  return (
    <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        残高推移
      </h2>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">
            {balanceLabelStart}
          </div>
          <div className="truncate text-lg font-semibold tabular-nums">
            {beginningBalance.toLocaleString()}円
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">
            {balanceLabelEnd}
          </div>
          <div className="truncate text-lg font-semibold tabular-nums">
            {endingBalance.toLocaleString()}円
          </div>
        </div>
      </div>

      {/* ミニチャート */}
      <svg
        viewBox="0 0 200 40"
        className="mt-3 h-10 w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path
          d={`M0,${startY} L200,${endY} L200,40 L0,40 Z`}
          fill={`url(#${gradientId})`}
        />
        <line
          x1="0"
          y1={startY}
          x2="200"
          y2={endY}
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* 差額 + 変化率 */}
      <div
        className={`mt-2 text-sm font-medium ${
          isUp
            ? 'text-green-600 dark:text-green-400'
            : isDown
              ? 'text-red-600 dark:text-red-400'
              : 'text-muted-foreground'
        }`}
      >
        {(diff >= 0 ? '+' : '') + diff.toLocaleString()}円
        {changePercent !== null && (
          <span className="ml-1 text-xs">
            ({diff >= 0 ? '+' : ''}
            {changePercent}%)
          </span>
        )}
      </div>
    </div>
  )
}
