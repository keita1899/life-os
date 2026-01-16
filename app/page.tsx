'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ModeSwitch } from '@/components/mode/ModeSwitch'
import { CalendarView } from '@/components/calendar/CalendarView'
import { useMode } from '@/lib/contexts/ModeContext'

export default function Home() {
  const { mode } = useMode()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="mb-4 text-3xl font-semibold text-black dark:text-zinc-50">
                Life OS
              </h1>
              <p className="text-muted-foreground">
                あなたの生活を管理するためのアプリケーション
              </p>
            </div>
            <ModeSwitch />
          </div>

          {mode === 'life' && (
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex-1">
                <CalendarView />
              </div>
              <aside className="w-full space-y-4 md:w-64 md:flex-shrink-0">
                <Card>
                  <CardHeader>
                    <CardTitle>目標管理</CardTitle>
                    <CardDescription>
                      年間・月間の目標を設定して管理
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/goals">目標管理へ</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>タスク管理</CardTitle>
                    <CardDescription>タスクを作成して管理</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/tasks">タスク管理へ</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>予定管理</CardTitle>
                    <CardDescription>予定を作成して管理</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/events">予定管理へ</Link>
                    </Button>
                  </CardContent>
                </Card>
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
