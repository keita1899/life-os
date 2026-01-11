export function getYearFromDate(date: string | null | undefined): number {
  if (date) {
    return new Date(date).getFullYear()
  }
  return new Date().getFullYear()
}

export function getMonthFromDate(date: string | null | undefined): number {
  if (date) {
    return new Date(date).getMonth() + 1
  }
  return new Date().getMonth() + 1
}
