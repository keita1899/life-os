'use client'

import { useMemo, type ReactElement } from 'react'
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
import type {
  TransactionCategory,
  CreateTransactionCategoryInput,
} from '@/lib/types/transaction-category'

const transactionCategoryFormSchema = z.object({
  name: z.string().trim().min(1, 'カテゴリー名は必須です'),
})

type TransactionCategoryFormValues = z.infer<typeof transactionCategoryFormSchema>

interface TransactionCategoryFormProps {
  onSubmit: (data: CreateTransactionCategoryInput) => Promise<void>
  onCancel?: () => void
  initialData?: TransactionCategory
  submitLabel?: string
}

export const TransactionCategoryForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: TransactionCategoryFormProps): ReactElement => {
  const formValues = useMemo<TransactionCategoryFormValues>(() => {
    return {
      name: initialData?.name || '',
    }
  }, [initialData])

  const form = useForm<TransactionCategoryFormValues>({
    resolver: zodResolver(transactionCategoryFormSchema),
    values: formValues,
  })

  const handleSubmit = async (data: TransactionCategoryFormValues): Promise<void> => {
    await onSubmit({
      name: data.name,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カテゴリー名</FormLabel>
              <FormControl>
                <Input placeholder="カテゴリー名を入力" {...field} />
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
