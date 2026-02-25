'use client'

import { useEffect, useMemo } from 'react'
import { format, startOfMonth, addMonths, startOfYear } from 'date-fns'
import { useAppMode } from '@/hooks/useAppMode'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useUserSettings } from '@/features/settings'
import { getWeekStartDate, getWeekDays } from '@/features/calendar'
import { useWizard } from '@/hooks/useWizard'
import { WizardShell } from './WizardShell'
import { MorningGoalsStep } from './morning/MorningGoalsStep'
import { MorningEventsStep } from './morning/MorningEventsStep'
import { MorningOverdueStep } from './morning/MorningOverdueStep'
import { MorningTodayTasksStep } from './morning/MorningTodayTasksStep'
import { MorningHabitsStep } from './morning/MorningHabitsStep'
import { EveningDiaryStep } from './evening/EveningDiaryStep'
import { EveningReportStep } from './evening/EveningReportStep'
import { EveningHabitsStep } from './evening/EveningHabitsStep'
import { EveningTomorrowEventsStep } from './evening/EveningTomorrowEventsStep'
import { EveningTomorrowStep } from './evening/EveningTomorrowStep'
import { WeekStartGoalsStep } from './week-start/WeekStartGoalsStep'
import { WeekStartEventsStep } from './week-start/WeekStartEventsStep'
import { WeekStartTasksStep } from './week-start/WeekStartTasksStep'
import { WeekEndCompletedTasksStep } from './week-end/WeekEndCompletedTasksStep'
import { WeekEndOverdueStep } from './week-end/WeekEndOverdueStep'
import { WeekEndHabitsStep } from './week-end/WeekEndHabitsStep'
import { WeekEndNextGoalsStep } from './week-end/WeekEndNextGoalsStep'
import { MonthStartGoalsStep } from './month-start/MonthStartGoalsStep'
import { MonthEndGoalsStep } from './month-end/MonthEndGoalsStep'
import { YearStartGoalsStep } from './year-start/YearStartGoalsStep'
import { YearEndGoalsStep } from './year-end/YearEndGoalsStep'
import type { ReviewMode, ReviewWizardType } from '../types/review-completion'

interface ReviewWizardProps {
  type: ReviewWizardType
  onComplete: () => Promise<void>
}

export function ReviewWizard({ type, onComplete }: ReviewWizardProps) {
  const { mode } = useAppMode()
  const today = useMemo(() => new Date(), [])
  const { userSettings } = useUserSettings()
  const weekStartDay = userSettings?.weekStartDay ?? 1
  const weekStartDate = useMemo(
    () => getWeekStartDate(today, weekStartDay),
    [today, weekStartDay],
  )
  const weekDays = useMemo(
    () => getWeekDays(today, weekStartDay),
    [today, weekStartDay],
  )
  const weekEndDate = weekDays[weekDays.length - 1]
  const weekStartDateStr = format(weekStartDate, 'yyyy-MM-dd')
  const weekEndDateStr = weekEndDate
    ? format(weekEndDate, 'yyyy-MM-dd')
    : weekStartDateStr
  const todayStr = format(today, 'yyyy-MM-dd')
  const currentMonth = useMemo(() => startOfMonth(today), [today])
  const nextMonth = useMemo(() => addMonths(today, 1), [today])
  const currentYear = useMemo(() => startOfYear(today), [today])
  const nextYear = useMemo(() => startOfYear(addMonths(today, 12)), [today])

  const { execute, operationError, setOperationError } = useAsyncOperation()

  const reviewMode: ReviewMode = mode === 'development' ? 'development' : 'life'

  const stepCount =
    type === 'year_start'
      ? 1
      : type === 'year_end'
        ? 1
        : type === 'month_start'
          ? 1
          : type === 'month_end'
            ? 1
            : type === 'morning'
              ? reviewMode === 'life'
                ? 5
                : 3
              : type === 'evening'
                ? reviewMode === 'life'
                  ? 5
                  : 3
                : type === 'week_start'
                  ? reviewMode === 'life'
                    ? 3
                    : 2
                  : type === 'week_end'
                    ? reviewMode === 'life'
                      ? 4
                      : 3
                    : 0

  const wizard = useWizard({
    stepCount,
    onComplete: () => {
      onComplete().catch(() => setOperationError('レビューの完了に失敗しました'))
    },
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
      <EveningTomorrowEventsStep key="tomorrow-events" today={today} />,
      <EveningTomorrowStep key="tomorrow-tasks" today={today} mode={reviewMode} />,
    ]
    const devSteps = [
      <EveningReportStep key="report" today={today} execute={execute} />,
      <MorningTodayTasksStep key="today" today={today} mode={reviewMode} />,
      <EveningTomorrowStep key="tomorrow" today={today} mode={reviewMode} />,
    ]
    const steps = reviewMode === 'life' ? lifeSteps : devSteps
    return steps[wizard.currentStep]
  }

  const renderWeekStartStep = () => {
    const lifeSteps = [
      <WeekStartGoalsStep
        key="goals"
        weekStartDate={weekStartDate}
        mode={reviewMode}
      />,
      <WeekStartEventsStep
        key="events"
        weekStartDate={weekStartDate}
        weekStartDay={weekStartDay}
      />,
      <WeekStartTasksStep
        key="tasks"
        weekStartDateStr={weekStartDateStr}
        weekEndDateStr={weekEndDateStr}
        mode={reviewMode}
      />,
    ]
    const devSteps = [
      <WeekStartGoalsStep
        key="goals"
        weekStartDate={weekStartDate}
        mode={reviewMode}
      />,
      <WeekStartTasksStep
        key="tasks"
        weekStartDateStr={weekStartDateStr}
        weekEndDateStr={weekEndDateStr}
        mode={reviewMode}
      />,
    ]
    const steps = reviewMode === 'life' ? lifeSteps : devSteps
    return steps[wizard.currentStep]
  }

  const renderMonthStartStep = () => (
    <MonthStartGoalsStep
      key="goals"
      currentMonth={currentMonth}
      mode={reviewMode}
    />
  )

  const renderMonthEndStep = () => (
    <MonthEndGoalsStep
      key="goals"
      nextMonth={nextMonth}
      mode={reviewMode}
      execute={execute}
    />
  )

  const renderYearStartStep = () => (
    <YearStartGoalsStep
      key="goals"
      currentYear={currentYear}
      mode={reviewMode}
    />
  )

  const renderYearEndStep = () => (
    <YearEndGoalsStep
      key="goals"
      nextYear={nextYear}
      mode={reviewMode}
    />
  )

  const renderWeekEndStep = () => {
    const lifeSteps = [
      <WeekEndCompletedTasksStep
        key="completed"
        weekStartDateStr={weekStartDateStr}
        weekEndDateStr={weekEndDateStr}
        mode={reviewMode}
      />,
      <WeekEndOverdueStep
        key="overdue"
        weekStartDateStr={weekStartDateStr}
        beforeDateStr={todayStr}
        mode={reviewMode}
      />,
      <WeekEndHabitsStep
        key="habits"
        weekStartDate={weekStartDate}
        weekStartDateStr={weekStartDateStr}
        weekEndDateStr={weekEndDateStr}
        weekStartDay={weekStartDay}
      />,
      <WeekEndNextGoalsStep
        key="next-goals"
        weekStartDate={weekStartDate}
        mode={reviewMode}
      />,
    ]
    const devSteps = [
      <WeekEndCompletedTasksStep
        key="completed"
        weekStartDateStr={weekStartDateStr}
        weekEndDateStr={weekEndDateStr}
        mode={reviewMode}
      />,
      <WeekEndOverdueStep
        key="overdue"
        weekStartDateStr={weekStartDateStr}
        beforeDateStr={todayStr}
        mode={reviewMode}
      />,
      <WeekEndNextGoalsStep
        key="next-goals"
        weekStartDate={weekStartDate}
        mode={reviewMode}
      />,
    ]
    const steps = reviewMode === 'life' ? lifeSteps : devSteps
    return steps[wizard.currentStep]
  }

  const content =
    type === 'year_start'
      ? renderYearStartStep()
      : type === 'year_end'
        ? renderYearEndStep()
        : type === 'month_start'
          ? renderMonthStartStep()
          : type === 'month_end'
            ? renderMonthEndStep()
            : type === 'morning'
              ? renderMorningStep()
              : type === 'evening'
                ? renderEveningStep()
                : type === 'week_start'
                  ? renderWeekStartStep()
                  : type === 'week_end'
                    ? renderWeekEndStep()
                    : null

  const title =
    type === 'year_start'
      ? '年始の確認'
      : type === 'year_end'
        ? '年末の確認'
        : type === 'month_start'
          ? '月初の確認'
          : type === 'month_end'
            ? '月末の確認'
            : type === 'morning'
              ? '朝の確認'
              : type === 'evening'
                ? '夜の確認'
                : type === 'week_start'
                  ? '週の始まりの確認'
                  : type === 'week_end'
                    ? '週の締めくくりの確認'
                    : ''

  const stepLabels = useMemo(() => {
    if (type === 'year_start') {
      return ['今年の目標を確認しましょう。']
    }
    if (type === 'year_end') {
      return ['来年の目標を確認しましょう。']
    }
    if (type === 'month_start') {
      return ['今月の目標を確認しましょう。']
    }
    if (type === 'month_end') {
      return [
        '来月の目標を立てましょう。',
      ]
    }
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
        '明日のタスクを確認しましょう。',
      ]
    }
    if (type === 'evening' && reviewMode === 'development') {
      return [
        '今日の日報を確認しましょう。',
        '残っている今日のタスクを確認しましょう。',
        '明日のタスクを確認しましょう。',
      ]
    }
    if (type === 'week_start' && reviewMode === 'life') {
      return [
        '今週の目標を確認しましょう。',
        '今週の予定を確認しましょう。',
        '今週のタスクを確認しましょう。',
      ]
    }
    if (type === 'week_start' && reviewMode === 'development') {
      return [
        '今週の目標を確認しましょう。',
        '今週のタスクを確認しましょう。',
      ]
    }
    if (type === 'week_end' && reviewMode === 'life') {
      return [
        '今週終わらせたタスクを確認しましょう。',
        '残っている今週の期限切れタスクを確認しましょう。',
        '今週の習慣の実行度合いを確認しましょう。',
        '来週の目標を立てましょう。',
      ]
    }
    if (type === 'week_end' && reviewMode === 'development') {
      return [
        '今週終わらせたタスクを確認しましょう。',
        '残っている今週の期限切れタスクを確認しましょう。',
        '来週の目標を立てましょう。',
      ]
    }
    return undefined
  }, [type, reviewMode])

  const wizardVariant =
    type === 'morning'
      ? ('morning' as const)
      : type === 'evening'
        ? ('evening' as const)
        : undefined

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
      variant={wizardVariant}
    >
      {content}
    </WizardShell>
  )
}
