import { addMonths, addYears, parseISO } from 'date-fns'
import type { BillingCycle, Subscription } from '../types/subscription'
import {
  getTodayDateString,
  getTomorrowDateString,
  formatDateISO,
} from '@/lib/date/formats'

export const BILLING_CYCLE_LABELS: Record<string, string> = {
  monthly: '月額',
  yearly: '年額',
  quarterly: '四半期',
  other: 'その他',
}

export function formatBillingCycle(billingCycle: string): string {
  return BILLING_CYCLE_LABELS[billingCycle] || billingCycle
}

export function calculateMonthlyTotal(
  subscriptions: Subscription[],
): number {
  return subscriptions
    .filter((sub) => sub.active)
    .reduce((sum, sub) => sum + sub.monthlyPrice, 0)
}

export function getUpcomingBillingSubscriptions(
  subscriptions: Subscription[],
): Subscription[] {
  const today = getTodayDateString()
  const tomorrow = getTomorrowDateString()

  return subscriptions.filter(
    (sub) =>
      sub.active &&
      (sub.nextBillingDate === today || sub.nextBillingDate === tomorrow),
  )
}

export function getSubscriptionsForDate(
  subscriptions: Subscription[],
  date: Date,
): Subscription[] {
  const dateStr = formatDateISO(date)
  return subscriptions.filter(
    (subscription) =>
      subscription.active && subscription.nextBillingDate === dateStr,
  )
}

/**
 * 更新日を過ぎた場合、billingCycle に応じて次の更新日を算出する。
 * 今日以降になるまで繰り返し加算する。
 */
export function advanceBillingDate(
  currentDate: string,
  billingCycle: BillingCycle,
): string | null {
  if (billingCycle === 'other') return null

  const today = getTodayDateString()
  if (currentDate > today) return null

  let date = parseISO(currentDate)
  const addFn =
    billingCycle === 'yearly'
      ? (d: Date) => addYears(d, 1)
      : billingCycle === 'quarterly'
        ? (d: Date) => addMonths(d, 3)
        : (d: Date) => addMonths(d, 1)

  while (formatDateISO(date) <= today) {
    date = addFn(date)
  }

  return formatDateISO(date)
}

/**
 * 契約中かつ更新日を過ぎたサブスクを返す。
 */
export function getExpiredActiveSubscriptions(
  subscriptions: Subscription[],
): Subscription[] {
  const today = getTodayDateString()
  return subscriptions.filter(
    (sub) =>
      sub.active &&
      sub.billingCycle !== 'other' &&
      sub.nextBillingDate <= today,
  )
}
