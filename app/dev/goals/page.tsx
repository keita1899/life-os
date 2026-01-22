'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useMode } from '@/lib/contexts/ModeContext'
import { YearSelect } from '@/components/goals/YearSelect'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'

export default function DevGoalsPage() {
  const { mode } = useMode()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  if (mode !== 'development') {
    return null
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">目標</h1>
          <YearSelect
            selectedYear={selectedYear}
            availableYears={[]}
            onYearChange={setSelectedYear}
          />
        </div>

        <div className="text-center py-8 text-muted-foreground">
          開発モードの目標機能は今後実装予定です
        </div>
      </div>
    </MainLayout>
  )
}
