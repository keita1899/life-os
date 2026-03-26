'use client'

import { Suspense, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { MiniCalendar } from '@/components/ui/mini-calendar'
import { useLogView } from '@/features/logs'
import { useDevDailyLog } from '@/features/dev/logs/hooks/useDevDailyLog'
import { LogReportSection } from '@/features/logs/components/LogReportSection'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import Link from 'next/link'

function ReportPageContent() {
  const { currentDate, dateString, displayTitle, isValidDate, handlePrev, handleNext, navigateToDate } =
    useLogView({ basePath: '/dev/report' })
  const { devDailyLog, isLoading, error, createDevDailyLog, updateDevDailyLog } =
    useDevDailyLog(dateString)
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const [calendarOpen, setCalendarOpen] = useState(false)

  if (!isValidDate) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">無効な日付です</h1>
          <Link
            href="/dev/report"
            className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← 日報に戻る
          </Link>
        </div>
      </div>
    )
  }

  const handleUpdate = async (input: { report?: string | null }) => {
    await execute(async () => {
      if (devDailyLog) {
        await updateDevDailyLog(input)
      } else {
        await createDevDailyLog({ logDate: dateString, report: input.report ?? null })
      }
    }, '日報の保存に失敗しました')
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{displayTitle}の日報</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">前日</span>
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="sr-only">日付を選択</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="end">
                <MiniCalendar
                  selectedDate={currentDate}
                  onSelectDate={(date) => {
                    navigateToDate(date)
                    setCalendarOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">翌日</span>
            </Button>
          </div>
        </div>
      </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      <LogReportSection
        devDailyLog={devDailyLog}
        isLoading={isLoading}
        onUpdate={handleUpdate}
      />
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReportPageContent />
    </Suspense>
  )
}
