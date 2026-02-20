'use client'

import type { ReactElement } from 'react'
import { useEffect, useCallback, useState, useMemo } from 'react'
import { useFormSubmitShortcut } from '@/hooks/useFormSubmitShortcut'
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
import { AutoResizeTextarea } from '@/components/ui/textarea-autosize'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { DevMemo, CreateDevMemoInput } from '../types/dev-memo'
import { useDevMemoTagSuggestions } from '../hooks/useDevMemoTagSuggestions'

const memoFormSchema = z.object({
  content: z.string().min(1, '本文は必須です'),
  tagInput: z.string().optional(),
})

type MemoFormValues = z.infer<typeof memoFormSchema>

interface MemoFormProps {
  onSubmit: (data: CreateDevMemoInput) => Promise<void>
  onCancel?: () => void
  initialData?: DevMemo
  submitLabel?: string
  fixedProjectId?: number | null
}

export function MemoForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = '作成',
  fixedProjectId,
}: MemoFormProps): ReactElement {
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [isTagInputFocused, setIsTagInputFocused] = useState(false)
  const allSuggestions = useDevMemoTagSuggestions()

  const form = useForm<MemoFormValues>({
    resolver: zodResolver(memoFormSchema),
    defaultValues: {
      content: initialData?.content ?? '',
      tagInput: '',
    },
  })

  const tagInput = form.watch('tagInput')

  useEffect(() => {
    if (initialData) {
      form.setValue('content', initialData.content)
      form.setValue('tagInput', '')
      setTags(initialData.tags)
    } else {
      form.reset({
        content: '',
        tagInput: '',
      })
      setTags([])
    }
  }, [initialData, form])

  const handleAddTag = useCallback(() => {
    const value = (tagInput ?? '').trim()
    if (!value || tags.includes(value)) return
    setTags((prev) => [...prev, value])
    form.setValue('tagInput', '')
  }, [tagInput, tags, form])

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const tagSuggestions = useMemo(() => {
    const current = (tagInput ?? '').trim().toLowerCase()
    const existing = new Set(tags)
    return allSuggestions.filter((s) => {
      if (existing.has(s)) return false
      if (!current) return true
      return s.toLowerCase().includes(current)
    })
  }, [allSuggestions, tagInput, tags])

  const handleSubmit = useCallback(
    async (data: MemoFormValues): Promise<void> => {
      const content = (data.content ?? '').trim()
      if (!content) {
        form.setError('content', { message: '本文は必須です' })
        return
      }
      const projectIdValue =
        fixedProjectId ?? initialData?.projectId ?? null
      await onSubmit({
        content,
        projectId: projectIdValue,
        tags,
      })
    },
    [onSubmit, tags, fixedProjectId, initialData?.projectId, form],
  )

  useFormSubmitShortcut({
    form,
    onSubmit: handleSubmit,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>本文 *</FormLabel>
                <FormControl>
                  <AutoResizeTextarea
                    placeholder="Markdown で記述できます"
                    minRows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タグ</FormLabel>
                <FormControl>
                  <div className="relative space-y-2">
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            role="button"
                            tabIndex={0}
                            className="inline-flex items-center gap-1 bg-slate-700 text-slate-100 dark:bg-slate-600 dark:text-slate-200 px-2.5 py-1 rounded-full text-xs cursor-pointer hover:bg-slate-600 dark:hover:bg-slate-500"
                            onClick={() => handleRemoveTag(tag)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleRemoveTag(tag)
                              }
                            }}
                          >
                            {tag}
                            <span className="ml-0.5 opacity-70" aria-hidden>×</span>
                          </span>
                        ))}
                      </div>
                    )}
                    <Input
                      placeholder="Enter で追加"
                      {...field}
                      onFocus={() => setIsTagInputFocused(true)}
                      onBlur={() => setIsTagInputFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    {isTagInputFocused && tagSuggestions.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1 py-1 bg-popover border border-border rounded-md shadow-md max-h-40 overflow-y-auto">
                        {tagSuggestions.slice(0, 20).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setTags((prev) =>
                                prev.includes(s) ? prev : [...prev, s]
                              )
                              form.setValue('tagInput', '')
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
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
