'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Check, X } from 'lucide-react'
import type { VisionCategory } from '@/lib/types/vision-category'

const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'カテゴリー名は必須です'),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface VisionCategoryEditFormProps {
  category: VisionCategory
  onSubmit: (name: string) => Promise<void>
  onCancel: () => void
}

export function VisionCategoryEditForm({
  category,
  onSubmit,
  onCancel,
}: VisionCategoryEditFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category.name,
    },
  })

  const handleSubmit = async (formValues: CategoryFormValues): Promise<void> => {
    await onSubmit(formValues.name)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-1 items-center gap-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  className="h-8"
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      onCancel()
                    }
                  }}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={form.formState.isSubmitting}
          className="h-8 w-8"
          aria-label="保存"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8"
          aria-label="キャンセル"
        >
          <X className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  )
}
