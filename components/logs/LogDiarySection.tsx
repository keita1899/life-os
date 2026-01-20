'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { DailyLog, UpdateDailyLogInput } from '@/lib/types/daily-log'

interface LogDiarySectionProps {
  dailyLog: DailyLog | null | undefined
  isLoading: boolean
  onUpdate: (input: UpdateDailyLogInput) => Promise<void>
}

export function LogDiarySection({
  dailyLog,
  isLoading: isLoadingLog,
  onUpdate,
}: LogDiarySectionProps) {
  const [diary, setDiary] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (dailyLog) {
      setDiary(dailyLog.diary || '')
    } else {
      setDiary('')
    }
  }, [dailyLog])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate({ diary: diary || null })
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = dailyLog?.diary !== diary

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">日記</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingLog ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={diary}
              onChange={(e) => setDiary(e.target.value)}
              placeholder="今日の日記を書いてください..."
              className="min-h-[200px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
