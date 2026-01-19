import { parseISO, differenceInYears } from 'date-fns'

export function calculateAgeAtYear(
  birthdate: string | null,
  targetYear: number | null,
): number | null {
  if (!birthdate || !targetYear) return null

  try {
    const birth = parseISO(birthdate)
    const targetDate = new Date(targetYear, 0, 1)
    return differenceInYears(targetDate, birth)
  } catch {
    return null
  }
}
