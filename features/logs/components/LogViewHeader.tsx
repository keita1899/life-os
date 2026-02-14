'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DayWeekMonthSelect } from '@/components/ui/day-week-month-select'

function getCalendarPath(basePath: string): string {
  return basePath.startsWith('/dev') ? '/dev' : '/'
}

interface LogViewHeaderProps {
  displayTitle: string
  basePath: string
  onPrev: () => void
  onNext: () => void
}

export function LogViewHeader({
  displayTitle,
  basePath,
  onPrev,
  onNext,
}: LogViewHeaderProps) {
  const router = useRouter()
  const calendarPath = getCalendarPath(basePath)

  const handleViewChange = (value: 'day' | 'week' | 'month') => {
    if (value === 'week') router.push(`${calendarPath}?view=week`)
    if (value === 'month') router.push(`${calendarPath}?view=month`)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{displayTitle}のログ</h1>
        <div className="flex items-center gap-2">
          <DayWeekMonthSelect
            value="day"
            onValueChange={handleViewChange}
            triggerClassName="w-20"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onPrev}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">前日</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">翌日</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
