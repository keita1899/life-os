'use client'

import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormSubmitShortcut } from '@/hooks/useFormSubmitShortcut'
import { formatShortcutKey } from '@/lib/utils/shortcut'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InterviewItem, CreateInterviewItemInput } from '../types/interview-item'
import type { InterviewCategory } from '../types/interview-category'

const formSchema = z.object({
  question: z.string().trim().min(1, '質問は必須です'),
  answer: z.string().optional(),
  categoryId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface InterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateInterviewItemInput) => Promise<void>
  item?: InterviewItem | null
  categories: InterviewCategory[]
  defaultCategoryId?: number | null
}

export function InterviewDialog({
  open,
  onOpenChange,
  onSubmit,
  item,
  categories,
  defaultCategoryId,
}: InterviewDialogProps) {
  const isEditing = !!item

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      answer: '',
      categoryId: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          question: item.question,
          answer: item.answer ?? '',
          categoryId: item.categoryId?.toString() ?? '',
        })
      } else {
        form.reset({
          question: '',
          answer: '',
          categoryId: defaultCategoryId?.toString() ?? '',
        })
      }
    }
  }, [open, item, defaultCategoryId, form])

  const handleSubmit = useCallback(
    async (values: FormValues): Promise<void> => {
      await onSubmit({
        question: values.question,
        answer: values.answer?.trim() || null,
        categoryId: values.categoryId && values.categoryId !== 'none'
          ? Number(values.categoryId)
          : null,
      })
    },
    [onSubmit],
  )

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Q&Aを編集' : 'Q&Aを作成'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>質問 *</FormLabel>
                  <FormControl>
                    <Input placeholder="質問を入力" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>返答</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="返答を入力（任意）"
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
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
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリーを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">なし</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                title={`保存 (${formatShortcutKey()})`}
              >
                {isEditing ? '更新' : '作成'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
