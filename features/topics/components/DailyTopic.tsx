'use client'

import { useMemo } from 'react'
import { Lightbulb, MessageCircle } from 'lucide-react'
import { getTodayDateString } from '@/lib/date/formats'
import { getDailyTopicIndex } from '../lib/daily-topic'
import type { TopicItem } from '../types/topic-item'

interface DailyTopicProps {
  items: TopicItem[]
}

export function DailyTopic({ items }: DailyTopicProps) {
  const dailyTopic = useMemo(() => {
    if (items.length === 0) return null
    const today = getTodayDateString()
    const index = getDailyTopicIndex(today, items.length)
    return items[index]
  }, [items])

  if (!dailyTopic) return null

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/50 dark:bg-amber-950/20">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
        <Lightbulb className="h-4 w-4" />
        今日のトピック
      </div>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Q
          </span>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
            {dailyTopic.question}
          </p>
        </div>
        {dailyTopic.answer ? (
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              A
            </span>
            <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
              {dailyTopic.answer}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="mt-0.5 shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              A
            </span>
            <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              未回答
            </span>
          </div>
        )}
      </div>
      {dailyTopic.category && (
        <div className="mt-2 text-xs text-muted-foreground">
          {dailyTopic.category.name}
        </div>
      )}
    </div>
  )
}
