'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  Subscription,
  CreateSubscriptionInput,
} from '@/lib/types/subscription'
import { formatDateForInput } from '@/lib/date/formats'

const subscriptionFormSchema = z.object({
  name: z.string().min(1, 'サブスク名は必須です'),
  monthlyPrice: z
    .string()
    .min(1, '月額料金は必須です')
    .refine(
      (val) => {
        const num = Number(val)
        return !isNaN(num) && num >= 0
      },
      '月額料金は0以上の数値で入力してください',
    ),
  billingCycle: z.enum(['monthly', 'yearly', 'quarterly', 'other'], {
    required_error: '支払い頻度を選択してください',
  }),
  nextBillingDate: z.string().min(1, '次回更新日は必須です'),
  startDate: z.string().optional(),
  cancellationUrl: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  active: z.boolean().optional(),
})

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>

interface SubscriptionFormProps {
  onSubmit: (data: CreateSubscriptionInput) => Promise<void>
  onCancel?: () => void
  initialData?: Subscription
  submitLabel?: string
}

export const SubscriptionForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: SubscriptionFormProps) => {
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    values: initialData
      ? {
          name: initialData.name,
          monthlyPrice: initialData.monthlyPrice.toString(),
          billingCycle: initialData.billingCycle,
          nextBillingDate: formatDateForInput(initialData.nextBillingDate),
          startDate: initialData.startDate
            ? formatDateForInput(initialData.startDate)
            : '',
          cancellationUrl: initialData.cancellationUrl || '',
          active: initialData.active,
        }
      : {
          name: '',
          monthlyPrice: '',
          billingCycle: undefined,
          nextBillingDate: '',
          startDate: '',
          cancellationUrl: '',
          active: true,
        },
  })

  const handleSubmit = async (data: SubscriptionFormValues) => {
    await onSubmit({
      name: data.name,
      monthlyPrice: Number(data.monthlyPrice),
      billingCycle: data.billingCycle,
      nextBillingDate: data.nextBillingDate,
      startDate: data.startDate || null,
      cancellationUrl: data.cancellationUrl || null,
      active: data.active,
    })
    if (!initialData) {
      form.reset()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>サブスク名</FormLabel>
              <FormControl>
                <Input placeholder="サブスク名を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthlyPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>月額料金（円）</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="月額料金を入力"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="billingCycle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>支払い頻度</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="支払い頻度を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monthly">月額</SelectItem>
                  <SelectItem value="yearly">年額</SelectItem>
                  <SelectItem value="quarterly">四半期</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextBillingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>次回更新日</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>開始日（任意）</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cancellationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>解約ページのリンク（任意）</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://..."
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? `${submitLabel === '作成' ? '作成中...' : '更新中...'}`
              : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
