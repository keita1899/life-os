'use client'

import { useMemo } from 'react'
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
  WishlistCategory,
  CreateWishlistCategoryInput,
} from '@/lib/types/wishlist-category'

const wishlistCategoryFormSchema = z.object({
  name: z.string().min(1, 'カテゴリー名は必須です'),
})

type WishlistCategoryFormValues = z.infer<typeof wishlistCategoryFormSchema>

interface WishlistCategoryFormProps {
  onSubmit: (data: CreateWishlistCategoryInput) => Promise<void>
  onCancel?: () => void
  initialData?: WishlistCategory
  submitLabel?: string
}

export const WishlistCategoryForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: WishlistCategoryFormProps) => {
  const formValues = useMemo<WishlistCategoryFormValues>(() => {
    return {
      name: initialData?.name || '',
    }
  }, [initialData])

  const form = useForm<WishlistCategoryFormValues>({
    resolver: zodResolver(wishlistCategoryFormSchema),
    values: formValues,
  })

  const handleSubmit = async (data: WishlistCategoryFormValues) => {
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
