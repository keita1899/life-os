'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useFormSubmitShortcut } from '@/hooks/useFormSubmitShortcut'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ChevronDown, Plus } from 'lucide-react'
import { formatDateForInput, getTodayDateString } from '@/lib/date/formats'
import { cn } from '@/lib/utils'
import { useTransactionCategories } from '@/hooks/useTransactionCategories'

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
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false)
  const [categorySearchQuery, setCategorySearchQuery] = useState('')

  useEffect(() => {
    if (transactionType) {
      form.setValue('categoryId', '')
      setCategoryComboboxOpen(false)
      setCategorySearchQuery('')
    }
  }, [transactionType, form])

  const handleCategoryChange = (value: string) => {
    if (value === 'none') {
      form.setValue('categoryId', '')
    } else {
      form.setValue('categoryId', value)
    }
    setCategoryComboboxOpen(false)
    setCategorySearchQuery('')
  }

  const handleCreateCategory = async () => {
    const newName = categorySearchQuery.trim()
    if (!newName) return

    try {
      const newCategory = await createTransactionCategory({ name: newName })
      form.setValue('categoryId', newCategory.id.toString())
      setCategoryComboboxOpen(false)
      setCategorySearchQuery('')
    } catch (err) {
      form.setError('categoryId', {
        type: 'server',
        message:
          err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました',
      })
    }
  }

  const handleSubmit = useCallback(async (data: TransactionFormValues) => {
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
  }, [onSubmit, initialData, form])

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

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
            render={({ field }) => {
              const selectedCategory = categories.find(
                (c) => c.id.toString() === field.value,
              )
              const displayValue =
                field.value !== '' && field.value !== undefined
                  ? selectedCategory?.name ?? field.value
                  : null
              const filteredCategories =
                categorySearchQuery.trim() === ''
                  ? categories
                  : categories.filter((c) =>
                      c.name
                        .toLowerCase()
                        .includes(categorySearchQuery.trim().toLowerCase()),
                    )
              const exactMatch = categories.find(
                (c) =>
                  c.name.toLowerCase() ===
                  categorySearchQuery.trim().toLowerCase(),
              )
              return (
                <FormItem>
                  <FormLabel>カテゴリー（任意）</FormLabel>
                  <Popover
                    open={categoryComboboxOpen}
                    onOpenChange={setCategoryComboboxOpen}
                  >
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={categoryComboboxOpen}
                          className="h-10 w-full justify-between font-normal"
                        >
                          {displayValue ?? 'カテゴリーを選択（オプション）'}
                          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent
                      className="z-[110] w-72 p-0"
                      align="start"
                      sideOffset={4}
                    >
                      <div className="p-2 border-b">
                        <Input
                          placeholder="検索..."
                          value={categorySearchQuery}
                          onChange={(e) =>
                            setCategorySearchQuery(e.target.value)
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="min-h-[100px] max-h-[300px] overflow-y-auto p-1">
                        {!exactMatch && categorySearchQuery.trim() !== '' && (
                          <button
                            type="button"
                            className="w-full flex items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground border-b mb-1"
                            onClick={handleCreateCategory}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            カテゴリー「{categorySearchQuery.trim()}」を作成
                          </button>
                        )}
                        {categorySearchQuery.trim() === '' && (
                          <button
                            type="button"
                            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() => handleCategoryChange('none')}
                          >
                            未分類
                          </button>
                        )}
                        {filteredCategories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() =>
                              handleCategoryChange(category.id.toString())
                            }
                          >
                            {category.name}
                          </button>
                        ))}
                        {filteredCategories.length === 0 &&
                          categorySearchQuery.trim() !== '' && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              該当するカテゴリーが見つかりません
                            </div>
                          )}
                        {categories.length === 0 &&
                          categorySearchQuery.trim() === '' && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              カテゴリーがありません
                            </div>
                          )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )
            }}
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
              ? `${submitLabel.startsWith('作成') ? '作成中...' : '更新中...'}`
              : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
