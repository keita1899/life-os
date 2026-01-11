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
  const displayAvailableYears =
    availableYears.length > 0 ? availableYears : [selectedYear]

  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="year-select" className="text-sm font-medium">
          年:
        </label>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => onYearChange(Number(value))}
        >
          <SelectTrigger id="year-select" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {displayAvailableYears.map((year) => {
              const currentYear = new Date().getFullYear()
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
