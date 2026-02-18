'use client'

import { format } from 'date-fns'
import { useDailyLog } from '@/features/logs'
import { LogDiarySection } from '@/features/logs'

interface EveningDiaryStepProps {
  today: Date
  execute: <T>(
    fn: () => Promise<T>,
    errorMessage: string,
  ) => Promise<T | undefined>
}

export function EveningDiaryStep({ today, execute }: EveningDiaryStepProps) {
  const dateStr = format(today, 'yyyy-MM-dd')
  const {
    dailyLog,
    isLoading,
    createDailyLog,
    updateDailyLog,
  } = useDailyLog(dateStr)

  const handleUpdate = async (input: { diary?: string | null }) => {
    await execute(
      async () => {
        if (dailyLog) {
          await updateDailyLog(input)
        } else {
          await createDailyLog({ logDate: dateStr, diary: input.diary })
        }
      },
      '日記の保存に失敗しました',
    )
  }

  return (
    <div className="space-y-5">
      <LogDiarySection
        dailyLog={dailyLog}
        isLoading={isLoading}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
