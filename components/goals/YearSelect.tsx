'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface YearSelectProps {
  selectedYear: number
  onYearChange: (year: number) => void
}

export const YearSelect = ({
  selectedYear,
  onYearChange,
}: YearSelectProps) => {
  const handlePrev = () => {
    onYearChange(selectedYear - 1)
  }

  const handleNext = () => {
    onYearChange(selectedYear + 1)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        className="h-8 w-8"
        aria-label="前の年"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[4rem] text-center text-lg font-semibold">
        {selectedYear}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="h-8 w-8"
        aria-label="次の年"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
