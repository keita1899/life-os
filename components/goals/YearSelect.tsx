'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface YearSelectProps {
  selectedYear: number
  availableYears: number[]
  onYearChange: (year: number) => void
}

export const YearSelect = ({
  selectedYear,
  availableYears,
  onYearChange,
}: YearSelectProps) => {
  const currentYear = new Date().getFullYear()
  const displayAvailableYears = Array.from(
    new Set(
      (availableYears.length > 0 ? availableYears : [selectedYear]).concat(
        availableYears.includes(selectedYear) ? [] : [selectedYear],
      ),
    ),
  )

  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span id="year-select-label" className="text-sm font-medium">
          年:
        </span>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => {
            const next = Number.parseInt(value, 10)
            if (!Number.isNaN(next)) onYearChange(next)
          }}
        >
          <SelectTrigger aria-labelledby="year-select-label" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {displayAvailableYears.map((year) => {
              const isCurrentYear = year === currentYear

              return (
                <SelectItem
                  key={year}
                  value={year.toString()}
                  className={
                    isCurrentYear
                      ? 'text-blue-600 dark:text-blue-400 focus:text-blue-600 dark:focus:text-blue-400'
                      : ''
                  }
                >
                  {year}年
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
