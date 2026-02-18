import { useState, useCallback } from 'react'

interface UseWizardOptions {
  stepCount: number
  onComplete?: () => void
}

export function useWizard({ stepCount, onComplete }: UseWizardOptions) {
  const [currentStep, setCurrentStep] = useState(0)

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep >= stepCount - 1

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, stepCount - 1))
  }, [stepCount])

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const complete = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  return {
    currentStep,
    goNext,
    goPrev,
    isFirstStep,
    isLastStep,
    complete,
  }
}
