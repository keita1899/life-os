'use client'

import Link from 'next/link'
import { Target, CheckSquare, Calendar } from 'lucide-react'
import { ModeSwitch } from '@/components/mode/ModeSwitch'
import { CalendarView } from '@/components/calendar/CalendarView'
import { useMode } from '@/lib/contexts/ModeContext'
import { cn } from '@/lib/utils'

export default function Home() {
  const { mode } = useMode()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-8 px-4 md:py-12 md:px-8 lg:px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <div className="mb-6 flex items-start justify-between">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Life OS
            </h1>
            <ModeSwitch />
          </div>

          {mode === 'life' && (
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1">
                <CalendarView />
              </div>
              <aside className="w-full lg:w-72 lg:flex-shrink-0">
                <nav className="space-y-2">
                  <Link
                    href="/goals"
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">目標管理</div>
                      <div className="text-sm text-muted-foreground">
                        年間・月間の目標を設定
                      </div>
                    </div>
                  </Link>
                  <Link
                    href="/tasks"
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
                      <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">タスク管理</div>
                      <div className="text-sm text-muted-foreground">
                        タスクを作成して管理
                      </div>
                    </div>
                  </Link>
                  <Link
                    href="/events"
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">予定管理</div>
                      <div className="text-sm text-muted-foreground">
                        予定を作成して管理
                      </div>
                    </div>
                  </Link>
                </nav>
              </aside>
            </div>
          )}
          {mode === 'development' && (
            <div className="text-center py-8 text-muted-foreground">
              開発モードの機能は今後追加予定です
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
