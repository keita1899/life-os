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
import { formatDateForInput, getTodayDateString } from '@/lib/date/formats'
import { cn } from '@/lib/utils'
import { useTransactionCategories } from '@/hooks/useTransactionCategories'
import { TransactionCategoryDialog } from './TransactionCategoryDialog'
import { useState, useEffect } from 'react'
import type { CreateTransactionCategoryInput } from '@/lib/types/transaction-category'

const transactionFormSchema = z.object({
  date: z.string().min(1, '日付は必須です'),
  type: z.enum(['income', 'expense']).refine(
    (val) => val !== undefined,
    '収入または支出を選択してください',
  ),
  name: z.string().min(1, '名前は必須です'),
  amount: z
    .string()
    .min(1, '金額は必須です')
    .refine(
      (val) => {
        const num = Number(val)
        return !isNaN(num) && num > 0
      },
      '金額は0より大きい数値で入力してください',
    ),
  categoryId: z.string().optional(),
  isFixed: z.boolean().optional(),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

import type { Transaction, CreateTransactionInput } from '@/lib/types/transaction'

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionInput) => Promise<void>
  onCancel?: () => void
  initialData?: Transaction
  submitLabel?: string
}

export const TransactionForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: TransactionFormProps) => {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: getTodayDateString(),
      type: 'expense',
      name: '',
      amount: '',
      categoryId: '',
      isFixed: false,
    },
    values: initialData
      ? {
          date: formatDateForInput(initialData.date),
          type: initialData.type,
          name: initialData.name,
          amount: initialData.amount.toString(),
          categoryId: initialData.categoryId?.toString() || '',
          isFixed: initialData.isFixed,
        }
      : undefined,
  })

  const transactionType = form.watch('type')
  const { categories, createTransactionCategory } = useTransactionCategories(
    transactionType || 'expense',
  )
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (transactionType) {
      form.setValue('categoryId', '')
      setSelectedCategoryId(null)
    }
  }, [transactionType, form])

  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
      setIsCategoryDialogOpen(true)
    } else if (value === 'none') {
      form.setValue('categoryId', '')
      setSelectedCategoryId(null)
    } else {
      form.setValue('categoryId', value)
      setSelectedCategoryId(value)
    }
  }

  const handleCategoryCreate = async (input: CreateTransactionCategoryInput) => {
    if (!transactionType) return

    try {
      const newCategory = await createTransactionCategory(input)
      const categoryIdStr = newCategory.id.toString()
      form.setValue('categoryId', categoryIdStr)
      setSelectedCategoryId(categoryIdStr)
      setIsCategoryDialogOpen(false)
    } catch (err) {
      form.setError('categoryId', {
        type: 'server',
        message: err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました',
      })
    }
  }

  const handleSubmit = async (data: TransactionFormValues) => {
    await onSubmit({
      date: data.date,
      type: data.type,
      name: data.name,
      amount: Number(data.amount),
      categoryId: data.categoryId && data.categoryId !== 'none' ? Number(data.categoryId) : null,
      isFixed: data.isFixed || false,
    })
    if (!initialData) {
      form.reset({
        date: getTodayDateString(),
        type: 'expense',
        name: '',
        amount: '',
        categoryId: '',
        isFixed: false,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>種類</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === 'income' ? 'default' : 'outline'}
                    onClick={() => field.onChange('income')}
                    className={cn(
                      'flex-1',
                      field.value === 'income' &&
                        'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800',
                    )}
                  >
                    収入
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'expense' ? 'default' : 'outline'}
                    onClick={() => field.onChange('expense')}
                    className={cn(
                      'flex-1',
                      field.value === 'expense' &&
                        'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
                    )}
                  >
                    支出
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>日付</FormLabel>
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="取引名を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>金額（円）</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="金額を入力"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {transactionType && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>カテゴリー（任意）</FormLabel>
                <Select
                  value={field.value || 'none'}
                  onValueChange={handleCategoryChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリーを選択（オプション）" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="item-aligned">
                    <SelectItem value="none">未分類</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="add-new">+ カテゴリーを追加</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {transactionType === 'expense' && (
          <FormField
            control={form.control}
            name="isFixed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>固定/変動</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={field.value ? 'default' : 'outline'}
                      onClick={() => field.onChange(true)}
                      className={cn(
                        'flex-1',
                        field.value &&
                          'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800',
                      )}
                    >
                      固定
                    </Button>
                    <Button
                      type="button"
                      variant={!field.value ? 'default' : 'outline'}
                      onClick={() => field.onChange(false)}
                      className={cn(
                        'flex-1',
                        !field.value &&
                          'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800',
                      )}
                    >
                      変動
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

      {transactionType && (
        <TransactionCategoryDialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
          onSubmit={handleCategoryCreate}
          type={transactionType}
        />
      )}
    </Form>
  )
}
