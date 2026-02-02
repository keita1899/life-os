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
import { BucketListCategoryDialog } from './BucketListCategoryDialog'
import { useBucketListCategories } from '@/hooks/useBucketListCategories'
import type {
  BucketListItem,
  CreateBucketListItemInput,
} from '@/lib/types/bucket-list-item'
import type { CreateBucketListCategoryInput } from '@/lib/types/bucket-list-category'

const bucketListItemFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  categoryId: z.string().optional(),
  targetYear: z.string().optional(),
  targetMonth: z.string().optional(),
})

type BucketListItemFormValues = z.infer<typeof bucketListItemFormSchema>

interface BucketListItemFormProps {
  onSubmit: (data: CreateBucketListItemInput) => Promise<void>
  onCancel?: () => void
  initialData?: BucketListItem
  defaultCategoryId?: string
  submitLabel?: string
}

export const BucketListItemForm = ({
  onSubmit,
  onCancel,
  initialData,
  defaultCategoryId = '',
  submitLabel = '作成',
}: BucketListItemFormProps) => {
  const { categories, createBucketListCategory } = useBucketListCategories()
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const presetYears = [currentYear, currentYear + 1, currentYear + 2]
  const [isOtherYearActive, setIsOtherYearActive] = useState(false)

  const form = useForm<BucketListItemFormValues>({
    resolver: zodResolver(bucketListItemFormSchema),
    values: initialData
      ? {
          title: initialData.title,
          categoryId: initialData.categoryId?.toString() || '',
          targetYear: initialData.targetYear?.toString() || '',
          targetMonth: initialData.targetMonth?.toString() || '',
        }
      : {
          title: '',
          categoryId: defaultCategoryId,
          targetYear: String(currentYear),
          targetMonth: '',
        },
  })

  const targetYearValue = form.watch('targetYear')
  useEffect(() => {
    if (targetYearValue === '' || targetYearValue === undefined) {
      form.setValue('targetMonth', '')
    }
  }, [targetYearValue, form])

  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
      setIsCategoryDialogOpen(true)
    } else if (value === 'none') {
      form.setValue('categoryId', '')
    } else {
      form.setValue('categoryId', value)
    }
  }

  const handleCategoryCreate = async (input: CreateBucketListCategoryInput) => {
    try {
      const newCategory = await createBucketListCategory(input)
      form.setValue('categoryId', newCategory.id.toString())
      setIsCategoryDialogOpen(false)
    } catch (err) {
      form.setError('categoryId', {
        type: 'server',
        message: err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました',
      })
    }
  }

  const handleSubmit = async (data: BucketListItemFormValues) => {
    await onSubmit({
      title: data.title,
      categoryId:
        data.categoryId === '' || data.categoryId === undefined
          ? null
          : Number(data.categoryId),
      targetYear:
        data.targetYear === '' || data.targetYear === undefined
          ? null
          : Number(data.targetYear),
      targetMonth:
        data.targetMonth === '' || data.targetMonth === undefined
          ? null
          : Number(data.targetMonth),
    })
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input placeholder="やりたいことのタイトルを入力" {...field} />
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
            render={({ field }) => {
              const yearStr = field.value ?? ''
              const yearNum = yearStr === '' ? null : Number(yearStr)
              const isPreset =
                yearStr === '' ||
                (yearNum !== null && Number.isInteger(yearNum) && presetYears.includes(yearNum))
              const showOtherInput = isOtherYearActive || (!isPreset && yearStr !== '')
              return (
                <FormItem>
                  <FormLabel>目標年</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={
                        !showOtherInput && yearStr === String(currentYear)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => {
                        setIsOtherYearActive(false)
                        field.onChange(String(currentYear))
                      }}
                    >
                      今年（{currentYear}）
                    </Button>
                    <Button
                      type="button"
                      variant={
                        !showOtherInput && yearStr === String(currentYear + 1)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => {
                        setIsOtherYearActive(false)
                        field.onChange(String(currentYear + 1))
                      }}
                    >
                      {currentYear + 1}
                    </Button>
                    <Button
                      type="button"
                      variant={
                        !showOtherInput && yearStr === String(currentYear + 2)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => {
                        setIsOtherYearActive(false)
                        field.onChange(String(currentYear + 2))
                      }}
                    >
                      {currentYear + 2}
                    </Button>
                    <Button
                      type="button"
                      variant={
                        !showOtherInput && yearStr === ''
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => {
                        setIsOtherYearActive(false)
                        field.onChange('')
                      }}
                    >
                      未定
                    </Button>
                    <Button
                      type="button"
                      variant={showOtherInput ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setIsOtherYearActive(true)
                        if (
                          yearStr !== '' &&
                          yearNum !== null &&
                          !presetYears.includes(yearNum)
                        ) {
                          field.onChange(yearStr)
                        } else {
                          field.onChange('')
                        }
                      }}
                    >
                      その他
                    </Button>
                  </div>
                  {showOtherInput && (
                    <FormControl className="mt-2">
                      <Input
                        type="number"
                        placeholder="例: 2029"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {targetYearValue !== '' && targetYearValue !== undefined && (
            <FormField
              control={form.control}
              name="targetMonth"
              render={({ field }) => {
                const monthValue = field.value ?? ''
                return (
                  <FormItem>
                    <FormLabel>目標月</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={monthValue === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => field.onChange('')}
                      >
                        未定
                      </Button>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <Button
                          key={m}
                          type="button"
                          variant={monthValue === String(m) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => field.onChange(String(m))}
                        >
                          {m}月
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )
              }}
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

      <BucketListCategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onSubmit={handleCategoryCreate}
      />
    </>
  )
}
