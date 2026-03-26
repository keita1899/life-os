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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RoadmapTask, CreateRoadmapTaskInput } from '../types/roadmap-task'
import type { RoadmapSection } from '../types/roadmap-section'

const taskFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  sectionId: z.string().optional(),
  targetYear: z.string().optional(),
  targetMonth: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface RoadmapTaskFormProps {
  onSubmit: (data: CreateRoadmapTaskInput) => Promise<void>
  onCancel?: () => void
  initialData?: RoadmapTask
  sections?: RoadmapSection[]
  projectId: number
  defaultSectionId?: string
  defaultTargetYear?: string
  defaultTargetMonth?: string
  submitLabel?: string
}

export function RoadmapTaskForm({
  onSubmit,
  onCancel,
  initialData,
  sections = [],
  projectId,
  defaultSectionId = '',
  defaultTargetYear = '',
  defaultTargetMonth = '',
  submitLabel = '作成',
}: RoadmapTaskFormProps) {
  const currentYear = new Date().getFullYear()
  const presetYears = [currentYear, currentYear + 1, currentYear + 2]
  const [isOtherYearActive, setIsOtherYearActive] = useState(false)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    values: initialData
      ? {
          title: initialData.title,
          sectionId: initialData.sectionId?.toString() || '',
          targetYear: initialData.targetYear?.toString() || '',
          targetMonth: initialData.targetMonth?.toString() || '',
        }
      : {
          title: '',
          sectionId: defaultSectionId,
          targetYear: defaultTargetYear,
          targetMonth: defaultTargetMonth,
        },
  })

  const targetYearValue = form.watch('targetYear')
  useEffect(() => {
    if (targetYearValue === '' || targetYearValue === undefined) {
      form.setValue('targetMonth', '')
    }
  }, [targetYearValue, form])

  const handleSubmit = useCallback(
    async (data: TaskFormValues) => {
      await onSubmit({
        title: data.title,
        projectId,
        sectionId:
          data.sectionId === '' || data.sectionId === undefined
            ? null
            : Number(data.sectionId),
        targetYear:
          data.targetYear === '' || data.targetYear === undefined
            ? null
            : Number(data.targetYear),
        targetMonth:
          data.targetMonth === '' || data.targetMonth === undefined
            ? null
            : Number(data.targetMonth),
      })
    },
    [onSubmit, projectId],
  )

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input placeholder="タスクのタイトルを入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {sections.length > 0 && (
          <FormField
            control={form.control}
            name="sectionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>セクション</FormLabel>
                <Select
                  value={field.value || 'none'}
                  onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="セクションを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">セクションなし</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
                      !showOtherInput && yearStr === '' ? 'default' : 'outline'
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
  )
}
