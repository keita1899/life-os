import type { Subscription } from '../types/subscription'
import { getTodayDateString, getTomorrowDateString } from '../date/formats'

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
