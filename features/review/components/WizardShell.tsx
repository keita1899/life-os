'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  children,
}: WizardShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="確認ウィザード"
    >
      <div className="flex min-h-[500px] max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xl">
        {(title || stepCount > 1 || stepLabels?.[0]) && (
          <header className="flex shrink-0 flex-col gap-4 bg-muted/30 px-6 py-4">
            {title && (
              <h1 className="text-lg font-medium tracking-tight text-foreground">
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
                            i < currentStep &&
                              'bg-primary text-primary-foreground',
                            i === currentStep &&
                              'bg-primary text-primary-foreground ring-2 ring-primary/30',
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
                              i < currentStep ? 'bg-primary' : 'bg-muted',
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

        <div className="flex flex-1 flex-col overflow-auto bg-muted/30 px-6 py-16">
          {operationError && (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {operationError}
            </p>
          )}
          {children}
        </div>

        <footer className="flex shrink-0 justify-end gap-2 bg-muted/30 px-6 py-4">
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
