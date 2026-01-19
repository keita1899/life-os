export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'other'

export interface Subscription {
  id: number
  name: string
  monthlyPrice: number
  billingCycle: BillingCycle
  nextBillingDate: string
  startDate: string | null
  cancellationUrl: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionInput {
  name: string
  monthlyPrice: number
  billingCycle: BillingCycle
  nextBillingDate: string
  startDate?: string | null
  cancellationUrl?: string | null
  active?: boolean
}

export interface UpdateSubscriptionInput {
  name?: string
  monthlyPrice?: number
  billingCycle?: BillingCycle
  nextBillingDate?: string
  startDate?: string | null
  cancellationUrl?: string | null
  active?: boolean
}
