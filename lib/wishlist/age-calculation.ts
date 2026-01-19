import { parseISO, differenceInYears, isValid } from 'date-fns'

export function calculateAgeAtYear(
  birthdate: string | null,
  targetYear: number | null,
): number | null {
  if (!birthdate || !targetYear) return null

  try {
    const birth = parseISO(birthdate)
    if (!isValid(birth)) {
      return null
    }
    const targetDate = new Date(targetYear, 0, 1)
    const age = differenceInYears(targetDate, birth)
    return Number.isNaN(age) ? null : age
  } catch {
    return null
  }
}
