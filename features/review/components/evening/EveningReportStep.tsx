'use client'

import { format } from 'date-fns'
import { useDevDailyLog } from '@/features/dev/logs'
import { DevLogReportSection } from '@/features/dev/logs'

interface EveningReportStepProps {
  today: Date
  execute: <T>(
    fn: () => Promise<T>,
    errorMessage: string,
  ) => Promise<T | undefined>
}

export function EveningReportStep({ today, execute }: EveningReportStepProps) {
  const dateStr = format(today, 'yyyy-MM-dd')
  const {
    devDailyLog,
    isLoading,
    createDevDailyLog,
    updateDevDailyLog,
  } = useDevDailyLog(dateStr)

  const handleUpdate = async (input: { report?: string | null }) => {
    await execute(
      async () => {
        if (devDailyLog) {
          await updateDevDailyLog(input)
        } else {
          await createDevDailyLog({ logDate: dateStr, report: input.report })
        }
      },
      '日報の保存に失敗しました',
    )
  }

  return (
    <div className="space-y-5">
      <DevLogReportSection
        devDailyLog={devDailyLog}
        isLoading={isLoading}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
