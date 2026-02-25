'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'

interface WizardShellProps {
  title?: string
  stepCount: number
  currentStep: number
  stepLabels?: string[]
  isFirstStep: boolean
  isLastStep: boolean
  onNext: () => void
  onComplete: () => void
  onPrev?: () => void
  operationError?: string | null
  variant?: 'morning' | 'evening'
  children: React.ReactNode
}

export function WizardShell({
  title,
  stepCount,
  currentStep,
  stepLabels,
  isFirstStep,
  isLastStep,
  onNext,
  onComplete,
  onPrev,
  operationError,
  variant,
  children,
}: WizardShellProps) {
  const isMorning = variant === 'morning'
  const isEvening = variant === 'evening'
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="確認ウィザード"
    >
      <div className={cn(
        'flex min-h-[500px] max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-2xl',
        isMorning && 'border-amber-200/60 dark:border-amber-800/40',
        isEvening && 'border-indigo-200/60 dark:border-indigo-800/40',
        !variant && 'border-border/80',
        'bg-background',
      )}>
        {(title || stepCount > 1 || stepLabels?.[0]) && (
          <header className={cn(
            'flex shrink-0 flex-col gap-4 px-6 py-4',
            isMorning && 'bg-amber-50/50 dark:bg-amber-950/20',
            isEvening && 'bg-indigo-50/50 dark:bg-indigo-950/20',
            !variant && 'bg-muted/30',
          )}>
            {title && (
              <h1 className={cn(
                'flex items-center gap-2 text-lg font-medium tracking-tight',
                isMorning && 'text-amber-900 dark:text-amber-200',
                isEvening && 'text-indigo-900 dark:text-indigo-200',
                !variant && 'text-foreground',
              )}>
                {isMorning && <Sun className="h-5 w-5" />}
                {isEvening && <Moon className="h-5 w-5" />}
                {title}
              </h1>
            )}
            {stepCount > 1 ? (
              <div className="flex flex-col items-center gap-5">
                <div className="flex w-full justify-center">
                  <div className="flex max-w-sm items-center">
                    {Array.from({ length: stepCount }, (_, i) => (
                      <div key={i} className="flex flex-1 items-center">
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors',
                            i < currentStep && (
                              isMorning
                                ? 'bg-amber-500 text-white dark:bg-amber-600'
                                : isEvening
                                  ? 'bg-indigo-500 text-white dark:bg-indigo-600'
                                  : 'bg-primary text-primary-foreground'
                            ),
                            i === currentStep && (
                              isMorning
                                ? 'bg-amber-500 text-white ring-2 ring-amber-300/50 dark:bg-amber-600 dark:ring-amber-500/30'
                                : isEvening
                                  ? 'bg-indigo-500 text-white ring-2 ring-indigo-300/50 dark:bg-indigo-600 dark:ring-indigo-500/30'
                                  : 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                            ),
                            i > currentStep &&
                              'border-2 border-border bg-background text-muted-foreground',
                          )}
                          aria-hidden
                        >
                          {i + 1}
                        </div>
                        {i < stepCount - 1 && (
                          <div
                            className={cn(
                              'h-0.5 min-w-[12px] flex-1 transition-colors',
                              i < currentStep
                                ? (isMorning ? 'bg-amber-500 dark:bg-amber-600' : isEvening ? 'bg-indigo-500 dark:bg-indigo-600' : 'bg-primary')
                                : 'bg-muted',
                            )}
                            aria-hidden
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {stepLabels?.[currentStep] && (
                  <p className="text-center text-base text-foreground">
                    {stepLabels[currentStep]}
                  </p>
                )}
              </div>
            ) : (
              stepLabels?.[currentStep] && (
                <p className="text-center text-base text-foreground">
                  {stepLabels[currentStep]}
                </p>
              )
            )}
          </header>
        )}

        <div className={cn(
          'flex flex-1 flex-col overflow-auto px-6 py-16',
          isMorning && 'bg-amber-50/30 dark:bg-amber-950/10',
          isEvening && 'bg-indigo-50/30 dark:bg-indigo-950/10',
          !variant && 'bg-muted/30',
        )}>
          {operationError && (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {operationError}
            </p>
          )}
          {children}
        </div>

        <footer className={cn(
          'flex shrink-0 justify-end gap-2 px-6 py-4',
          isMorning && 'bg-amber-50/50 dark:bg-amber-950/20',
          isEvening && 'bg-indigo-50/50 dark:bg-indigo-950/20',
          !variant && 'bg-muted/30',
        )}>
          {!isFirstStep && onPrev && (
            <Button type="button" variant="outline" size="sm" onClick={onPrev}>
              <ChevronLeft className="h-4 w-4" />
              前へ
            </Button>
          )}
          {isLastStep ? (
            <Button type="button" size="sm" onClick={onComplete}>
              確認完了
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={onNext}>
              次へ
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </footer>
      </div>
    </div>
  )
}
