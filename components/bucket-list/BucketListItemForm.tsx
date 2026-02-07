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
import { useBucketListCategories } from '@/hooks/useBucketListCategories'
import type {
  BucketListItem,
  CreateBucketListItemInput,
} from '@/lib/types/bucket-list-item'

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
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false)
  const [categorySearchQuery, setCategorySearchQuery] = useState('')
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
      const newCategory = await createBucketListCategory({ name: newName })
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

  const handleSubmit = useCallback(async (data: BucketListItemFormValues) => {
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
  }, [onSubmit])

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

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
                  <FormLabel>カテゴリー</FormLabel>
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
                            カテゴリー「{categorySearchQuery.trim()}
                            」を作成
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
                ? `${submitLabel.startsWith('作成') ? '作成中...' : '更新中...'}`
                : submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
