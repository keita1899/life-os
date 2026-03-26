'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { parseISO, isValid, format, addDays, subDays } from 'date-fns'
import { ja } from 'date-fns/locale/ja'

interface UseLogViewOptions {
  basePath: string
}

export function useLogView({ basePath }: UseLogViewOptions) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const dateParam = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
  const logDate = parseISO(dateParam)
  const isValidDate = isValid(logDate)
  const currentDate = isValidDate ? logDate : new Date()

  const displayTitle = format(currentDate, 'yyyy年M月d日(E)', { locale: ja })

  const handlePrev = () => {
    const prevDate = subDays(currentDate, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', format(prevDate, 'yyyy-MM-dd'))
    router.push(`${basePath}?${params.toString()}`)
  }

  const handleNext = () => {
    const nextDate = addDays(currentDate, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', format(nextDate, 'yyyy-MM-dd'))
    router.push(`${basePath}?${params.toString()}`)
  }

  const navigateToDate = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', format(date, 'yyyy-MM-dd'))
    router.push(`${basePath}?${params.toString()}`)
  }

  return {
    currentDate,
    datesToShow: [currentDate],
    displayTitle,
    isValidDate,
    dateString: format(currentDate, 'yyyy-MM-dd'),
    handlePrev,
    handleNext,
    navigateToDate,
  }
}
