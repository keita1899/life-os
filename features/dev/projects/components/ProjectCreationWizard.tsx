'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MarkdownTextarea } from '@/components/ui/markdown-textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useWizard } from '@/hooks/useWizard'
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import type { CreateDevProjectInput, ProjectStatus } from '../types/dev-project'

const REQUIREMENT_SECTIONS = [
  {
    key: 'overview',
    title: '概要',
    label: 'プロジェクトの概要を書きましょう。',
    placeholder: 'このプロジェクトは何をするものですか？',
  },
  {
    key: 'purpose',
    title: '目的',
    label: 'プロジェクトの目的を書きましょう。',
    placeholder: 'なぜこのプロジェクトを作るのですか？',
  },
  {
    key: 'background',
    title: '背景',
    label: 'プロジェクトの背景を書きましょう。',
    placeholder: 'このプロジェクトが必要になった背景は？',
  },
  {
    key: 'target',
    title: 'ターゲット',
    label: 'ターゲットユーザーを書きましょう。',
    placeholder: '誰が使いますか？（箇条書き推奨）',
  },
  {
    key: 'competitors',
    title: '競合',
    label: '競合サービスを書きましょう。',
    placeholder: '似たサービスやプロダクトはありますか？（箇条書き推奨）',
  },
  {
    key: 'features',
    title: '機能要件',
    label: '機能要件を書きましょう。',
    placeholder: '必要な機能を書きましょう（箇条書き推奨）',
  },
  {
    key: 'nonFeatures',
    title: '非機能要件',
    label: '非機能要件を書きましょう。',
    placeholder: 'パフォーマンス、セキュリティなどの要件（箇条書き推奨）',
  },
  {
    key: 'techStack',
    title: '技術スタック',
    label: '技術スタックを書きましょう。',
    placeholder: '使用する技術やフレームワーク（箇条書き推奨）',
  },
] as const

type RequirementKey = (typeof REQUIREMENT_SECTIONS)[number]['key']
type RequirementsData = Record<RequirementKey, string>

const INITIAL_REQUIREMENTS: RequirementsData = {
  overview: '',
  purpose: '',
  background: '',
  target: '',
  competitors: '',
  features: '',
  nonFeatures: '',
  techStack: '',
}

interface ProjectCreationWizardProps {
  open: boolean
  onClose: () => void
  onSubmit: (
    input: CreateDevProjectInput,
    requirementsContent: string,
  ) => Promise<void>
}

export function ProjectCreationWizard({
  open,
  onClose,
  onSubmit,
}: ProjectCreationWizardProps) {
  const totalSteps = 1 + REQUIREMENT_SECTIONS.length

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('draft')
  const [requirements, setRequirements] =
    useState<RequirementsData>(INITIAL_REQUIREMENTS)
  const [nameError, setNameError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const buildRequirementsMarkdown = useCallback((): string => {
    return (
      REQUIREMENT_SECTIONS.map(({ key, title }) => {
        const content = requirements[key].trim()
        if (content) {
          return `## ${title}\n\n${content}`
        }
        return `## ${title}\n\n`
      }).join('\n\n') + '\n'
    )
  }, [requirements])

  const handleComplete = useCallback(async () => {
    if (!name.trim()) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const content = buildRequirementsMarkdown()
      await onSubmit(
        {
          name: name.trim(),
          startDate: startDate || null,
          endDate: endDate || null,
          status,
        },
        content,
      )
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'プロジェクトの作成に失敗しました',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [name, startDate, endDate, status, buildRequirementsMarkdown, onSubmit])

  const wizard = useWizard({
    stepCount: totalSteps,
    onComplete: handleComplete,
  })

  const validateAndGoNext = useCallback(() => {
    if (wizard.currentStep === 0) {
      if (!name.trim()) {
        setNameError('プロジェクト名は必須です')
        return
      }
      setNameError(null)
    }
    setSubmitError(null)
    wizard.goNext()
  }, [wizard, name])

  const handlePrev = useCallback(() => {
    setSubmitError(null)
    wizard.goPrev()
  }, [wizard])

  const handleSkip = useCallback(() => {
    const section = REQUIREMENT_SECTIONS[wizard.currentStep - 1]
    if (section) {
      setRequirements((prev) => ({ ...prev, [section.key]: '' }))
    }
    setSubmitError(null)
    wizard.goNext()
  }, [wizard])

  const handleRequirementChange = useCallback(
    (key: RequirementKey, value: string) => {
      setRequirements((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const stepLabels = useMemo(
    () => [
      'プロジェクトの基本情報を入力しましょう。',
      ...REQUIREMENT_SECTIONS.map((s) => s.label),
    ],
    [],
  )

  if (!open) return null

  const currentSection =
    wizard.currentStep > 0
      ? REQUIREMENT_SECTIONS[wizard.currentStep - 1]
      : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="プロジェクト作成ウィザード"
    >
      <div className="flex max-h-[90vh] min-h-[500px] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xl">
        <header className="flex shrink-0 flex-col gap-4 bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium tracking-tight">
              新しいプロジェクトを作成
            </h1>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              キャンセル
            </Button>
          </div>
          <div className="flex flex-col items-center gap-5">
            <div className="flex w-full justify-center">
              <div className="flex max-w-lg items-center">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div key={i} className="flex flex-1 items-center">
                    <div
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums transition-colors',
                        i < wizard.currentStep &&
                          'bg-primary text-primary-foreground',
                        i === wizard.currentStep &&
                          'bg-primary text-primary-foreground ring-2 ring-primary/30',
                        i > wizard.currentStep &&
                          'border-2 border-border bg-background text-muted-foreground',
                      )}
                      aria-hidden
                    >
                      {i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                      <div
                        className={cn(
                          'h-0.5 min-w-[8px] flex-1 transition-colors',
                          i < wizard.currentStep ? 'bg-primary' : 'bg-muted',
                        )}
                        aria-hidden
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-base text-foreground">
              {stepLabels[wizard.currentStep]}
            </p>
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-auto bg-muted/30 px-6 py-10">
          {submitError && (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          {wizard.currentStep === 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  プロジェクト名 *
                </label>
                <Input
                  placeholder="プロジェクト名を入力"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (nameError) setNameError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      validateAndGoNext()
                    }
                  }}
                  autoFocus
                />
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">開始日</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">期限（終了日）</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ステータス</label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as ProjectStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">下書き</SelectItem>
                    <SelectItem value="in_progress">進行中</SelectItem>
                    <SelectItem value="released">リリース済み</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : currentSection ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{currentSection.title}</h2>
              <MarkdownTextarea
                placeholder={currentSection.placeholder}
                value={requirements[currentSection.key]}
                onChange={(e) =>
                  handleRequirementChange(currentSection.key, e.target.value)
                }
                minRows={6}
                autoFocus
              />
            </div>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-between bg-muted/30 px-6 py-4">
          <div>
            {!wizard.isFirstStep && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {wizard.currentStep > 0 && !wizard.isLastStep && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSkip}
              >
                スキップ
                <SkipForward className="h-4 w-4" />
              </Button>
            )}
            {wizard.isLastStep ? (
              <Button
                type="button"
                size="sm"
                onClick={wizard.complete}
                disabled={isSubmitting}
              >
                {isSubmitting ? '作成中...' : '作成'}
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={validateAndGoNext}>
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
