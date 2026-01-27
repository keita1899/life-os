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
import { Plus } from 'lucide-react'

const categoryFormSchema = z.object({
  name: z.string().min(1, 'カテゴリー名は必須です'),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface VisionCategoryCreateFormProps {
  onSubmit: (name: string) => Promise<void>
}

export function VisionCategoryCreateForm({
  onSubmit,
}: VisionCategoryCreateFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
    },
  })

  const handleSubmit = async (data: CategoryFormValues) => {
    await onSubmit(data.name.trim())
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="新しいカテゴリー"
                    className="h-9"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="icon"
            disabled={form.formState.isSubmitting}
            className="h-9 w-9"
            aria-label="追加"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
