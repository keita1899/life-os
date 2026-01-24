'use client'

import type { ReactElement } from 'react'
import { useEffect } from 'react'
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
import type {
  DevProject,
  CreateDevProjectInput,
} from '@/lib/types/dev-project'

const projectFormSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'released']).optional(),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  onSubmit: (data: CreateDevProjectInput) => Promise<void>
  onCancel?: () => void
  initialData?: DevProject
  submitLabel?: string
}

export function ProjectForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
}: ProjectFormProps): ReactElement {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      status: 'draft',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        status: initialData.status,
      })
    } else {
      form.reset({
        name: '',
        startDate: '',
        endDate: '',
        status: 'draft',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  const handleSubmit = async (data: ProjectFormValues): Promise<void> => {
    const name = data.name || ''
    if (!name || name.trim() === '') {
      form.setError('name', { message: 'プロジェクト名は必須です' })
      return
    }

    await onSubmit({
      name,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      status: data.status || 'draft',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>プロジェクト名 *</FormLabel>
                <FormControl>
                  <Input placeholder="プロジェクト名を入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>開始日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>期限（終了日）</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ステータス</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">下書き</SelectItem>
                    <SelectItem value="in_progress">進行中</SelectItem>
                    <SelectItem value="released">リリース済み</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          )}
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  )
}

