import { parseISO, getMonth, isValid } from 'date-fns'

export function calculateAgeAtYear(
  birthdate: string | null,
  targetYear: number | null,
  targetMonth: number | null = null,
): number | null {
  if (!birthdate || !targetYear) return null

  try {
    const birth = parseISO(birthdate)
    if (!isValid(birth)) {
      return null
    }
    const birthYear = birth.getFullYear()
    const birthMonth = getMonth(birth) + 1
    const month = targetMonth ?? 12
    const hasHadBirthday = month >= birthMonth
    const age = hasHadBirthday
      ? targetYear - birthYear
      : targetYear - birthYear - 1
    return Number.isNaN(age) ? null : age
  } catch {
    return null
  }
}
