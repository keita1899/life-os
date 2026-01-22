'use client'

import { type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ViewMode = 'month' | 'week'

interface CalendarViewBaseProps {
  displayTitle: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onPrev: () => void
  onNext: () => void
  isLoading: boolean
  children: ReactNode
}

export function CalendarViewBase({
  displayTitle,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  isLoading,
  children,
}: CalendarViewBaseProps) {
  return (
    <div className="w-full space-y-4">
      <Card className="border-border shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{displayTitle}</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={viewMode}
                onValueChange={(value) => onViewModeChange(value as ViewMode)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">
                    <span className="flex items-center justify-between w-full">
                      <span>月</span>
                      <span className="ml-4 text-xs text-muted-foreground">
                        M
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="week">
                    <span className="flex items-center justify-between w-full">
                      <span>週</span>
                      <span className="ml-4 text-xs text-muted-foreground">
                        W
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
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
