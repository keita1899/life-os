'use client'

import { useState, useEffect } from 'react'
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
import { WishlistCategoryDialog } from './WishlistCategoryDialog'
import { useWishlistCategories } from '@/hooks/useWishlistCategories'
import type {
  WishlistItem,
  CreateWishlistItemInput,
} from '@/lib/types/wishlist-item'
import type { CreateWishlistCategoryInput } from '@/lib/types/wishlist-category'

const wishlistItemFormSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  categoryId: z.string().optional(),
  targetYear: z.string().optional(),
  price: z.string().optional(),
  purchased: z.boolean().optional(),
})

type WishlistItemFormValues = z.infer<typeof wishlistItemFormSchema>

interface WishlistItemFormProps {
  onSubmit: (data: CreateWishlistItemInput) => Promise<void>
  onCancel?: () => void
  initialData?: WishlistItem
  submitLabel?: string
}

export const WishlistItemForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: WishlistItemFormProps) => {
  const { categories, createWishlistCategory } = useWishlistCategories()
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )

  const form = useForm<WishlistItemFormValues>({
    resolver: zodResolver(wishlistItemFormSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      targetYear: '',
      price: '',
      purchased: false,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        categoryId: initialData.categoryId?.toString() || '',
        targetYear: initialData.targetYear?.toString() || '',
        price: initialData.price?.toString() || '',
        purchased: initialData.purchased || false,
      })
    } else {
      form.reset({
        name: '',
        categoryId: '',
        targetYear: '',
        price: '',
        purchased: false,
      })
    }
  }, [initialData, form])

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

  const handleCategoryCreate = async (input: CreateWishlistCategoryInput) => {
    try {
      const newCategory = await createWishlistCategory(input)
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

  const handleSubmit = async (data: WishlistItemFormValues) => {
    await onSubmit({
      name: data.name,
      categoryId:
        data.categoryId === '' || data.categoryId === undefined
          ? null
          : Number(data.categoryId),
      targetYear:
        data.targetYear === '' || data.targetYear === undefined
          ? null
          : Number(data.targetYear),
      price:
        data.price === '' || data.price === undefined
          ? null
          : Number(data.price),
      purchased: data.purchased || false,
    })
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前</FormLabel>
                <FormControl>
                  <Input placeholder="欲しいものの名前を入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>カテゴリー</FormLabel>
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
                      <SelectItem key={category.id} value={category.id.toString()}>
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

          <FormField
            control={form.control}
            name="targetYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>購入予定年</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="例: 2026"
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>金額</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="例: 10000"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {initialData && (
            <FormField
              control={form.control}
              name="purchased"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">購入済み</FormLabel>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-stone-700"
                    />
                  </FormControl>
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
      </Form>

      <WishlistCategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onSubmit={handleCategoryCreate}
      />
    </>
  )
}
