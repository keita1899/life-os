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

const visionFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
})

type VisionFormValues = z.infer<typeof visionFormSchema>

interface VisionFormProps {
  initialTitle?: string
  onSubmit: (title: string) => Promise<void>
  onCancel: () => void
}

export function VisionForm({
  initialTitle = '',
  onSubmit,
  onCancel,
}: VisionFormProps) {
  const form = useForm<VisionFormValues>({
    resolver: zodResolver(visionFormSchema),
    defaultValues: {
      title: initialTitle,
    },
  })

  const handleSubmit = async (data: VisionFormValues) => {
    await onSubmit(data.title.trim())
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex items-center gap-2"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="ビジョンを入力"
                  className="h-9"
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
          className="h-9 w-9"
          aria-label="保存"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-9 w-9"
          aria-label="キャンセル"
        >
          <X className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  )
}
