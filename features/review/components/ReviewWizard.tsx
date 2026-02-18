'use client'

import { useEffect, useMemo } from 'react'
import { useAppMode } from '@/hooks/useAppMode'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useWizard } from '../hooks/useWizard'
import { WizardShell } from './WizardShell'
import { MorningGoalsStep } from './morning/MorningGoalsStep'
import { MorningEventsStep } from './morning/MorningEventsStep'
import { MorningOverdueStep } from './morning/MorningOverdueStep'
import { MorningTodayTasksStep } from './morning/MorningTodayTasksStep'
import { MorningHabitsStep } from './morning/MorningHabitsStep'
import { EveningDiaryStep } from './evening/EveningDiaryStep'
import { EveningReportStep } from './evening/EveningReportStep'
import { EveningHabitsStep } from './evening/EveningHabitsStep'
import { EveningTomorrowStep } from './evening/EveningTomorrowStep'
import type { ReviewMode } from '../types/review-completion'

type ReviewWizardType = 'morning' | 'evening'

interface ReviewWizardProps {
  type: ReviewWizardType
  onComplete: () => Promise<void>
}

export function ReviewWizard({ type, onComplete }: ReviewWizardProps) {
  const { mode } = useAppMode()
  const today = useMemo(() => new Date(), [])
  const { execute, operationError, setOperationError } = useAsyncOperation()

  const reviewMode: ReviewMode = mode === 'development' ? 'development' : 'life'

  const stepCount =
    type === 'morning'
      ? reviewMode === 'life'
        ? 5
        : 3
      : reviewMode === 'life'
        ? 4
        : 3

  const wizard = useWizard({
    stepCount,
    onComplete: () => void onComplete(),
  })

  useEffect(() => {
    setOperationError(null)
  }, [wizard.currentStep, setOperationError])

  const renderMorningStep = () => {
    const lifeSteps = [
      <MorningGoalsStep key="goals" today={today} mode={reviewMode} />,
      <MorningEventsStep key="events" today={today} />,
      <MorningOverdueStep
        key="overdue"
        today={today}
        mode={reviewMode}
        execute={execute}
      />,
      <MorningTodayTasksStep key="today" today={today} mode={reviewMode} />,
      <MorningHabitsStep key="habits" today={today} />,
    ]
    const devSteps = [
      <MorningGoalsStep key="goals" today={today} mode={reviewMode} />,
      <MorningOverdueStep
        key="overdue"
        today={today}
        mode={reviewMode}
        execute={execute}
      />,
      <MorningTodayTasksStep key="today" today={today} mode={reviewMode} />,
    ]
    const steps = reviewMode === 'life' ? lifeSteps : devSteps
    return steps[wizard.currentStep]
  }

  const renderEveningStep = () => {
    const lifeSteps = [
      <EveningDiaryStep key="diary" today={today} execute={execute} />,
      <MorningTodayTasksStep key="today" today={today} mode={reviewMode} />,
      <EveningHabitsStep key="habits" today={today} execute={execute} />,
      <EveningTomorrowStep key="tomorrow" today={today} mode={reviewMode} />,
    ]
    const devSteps = [
      <EveningReportStep key="report" today={today} execute={execute} />,
      <MorningTodayTasksStep key="today" today={today} mode={reviewMode} />,
      <EveningTomorrowStep key="tomorrow" today={today} mode={reviewMode} />,
    ]
    const steps = reviewMode === 'life' ? lifeSteps : devSteps
    return steps[wizard.currentStep]
  }

  const content =
    type === 'morning' ? (
      renderMorningStep()
    ) : (
      renderEveningStep()
    )

  const title = type === 'morning' ? '朝の確認' : '夜の確認'

  const stepLabels = useMemo(() => {
    if (type === 'morning' && reviewMode === 'life') {
      return [
        'おはようございます。目標を確認しましょう。',
        '今日の予定を確認しましょう。',
        '期限切れのタスクを確認しましょう。',
        '今日のタスクを確認しましょう。',
        '今日の習慣を確認しましょう。',
      ]
    }
    if (type === 'morning' && reviewMode === 'development') {
      return [
        'おはようございます。目標を確認しましょう。',
        '期限切れのタスクを確認しましょう。',
        '今日のタスクを確認しましょう。',
      ]
    }
    if (type === 'evening' && reviewMode === 'life') {
      return [
        '今日の日記を確認しましょう。',
        '残っている今日のタスクを確認しましょう。',
        '今日の習慣をチェックしましょう。',
        '明日の予定を確認しましょう。',
      ]
    }
    if (type === 'evening' && reviewMode === 'development') {
      return [
        '今日の日報を確認しましょう。',
        '残っている今日のタスクを確認しましょう。',
        '明日の予定を確認しましょう。',
      ]
    }
    return undefined
  }, [type, reviewMode])

  return (
    <WizardShell
      title={title}
      stepCount={stepCount}
      currentStep={wizard.currentStep}
      stepLabels={stepLabels}
      isFirstStep={wizard.isFirstStep}
      isLastStep={wizard.isLastStep}
      onNext={wizard.goNext}
      onComplete={wizard.complete}
      onPrev={wizard.goPrev}
      operationError={operationError}
    >
      {content}
    </WizardShell>
  )
}
