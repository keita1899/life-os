'use client'

import { useMode } from '@/lib/contexts/ModeContext'
import { CalendarView } from '@/components/calendar/CalendarView'
import { MainLayout } from '@/components/layout/MainLayout'

export default function Home() {
  const { mode } = useMode()

  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl py-8 px-4 md:py-12 md:px-8 lg:px-16">
        {mode === 'life' && (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <CalendarView />
            </div>
          </div>
        )}
        {mode === 'development' && (
          <div className="text-center py-8 text-muted-foreground">
            開発モードの機能は今後追加予定です
          </div>
        )}
      </div>
    </MainLayout>
  )
}
