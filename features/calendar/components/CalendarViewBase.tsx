'use client'

import { type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DayWeekMonthSelect } from '@/components/ui/day-week-month-select'
import { cn } from '@/lib/utils'

type ViewMode = 'month' | 'week'

interface CalendarViewBaseProps {
  displayTitle: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onNavigateToLog?: () => void
  onPrev: () => void
  onNext: () => void
  isLoading: boolean
  children: ReactNode
  cardClassName?: string
}

export function CalendarViewBase({
  displayTitle,
  viewMode,
  onViewModeChange,
  onNavigateToLog,
  onPrev,
  onNext,
  isLoading,
  children,
  cardClassName,
}: CalendarViewBaseProps) {
  const handleViewChange = (value: 'day' | 'week' | 'month') => {
    if (value === 'day') onNavigateToLog?.()
    else onViewModeChange(value)
  }

  return (
    <div className="w-full space-y-4">
      <Card className={cn('border-border shadow-none', cardClassName)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{displayTitle}</CardTitle>
            <div className="flex items-center gap-2">
              <DayWeekMonthSelect
                value={viewMode}
                onValueChange={handleViewChange}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={onPrev}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">
                  {viewMode === 'month' ? '前の月' : '前の週'}
                </span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onNext}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">
                  {viewMode === 'month' ? '次の月' : '次の週'}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex h-96 items-center justify-center text-muted-foreground">
              読み込み中...
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  )
}
