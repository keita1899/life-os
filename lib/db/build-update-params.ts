export type FieldMapping<T extends object> = Array<{
  key: keyof T
  column: string
  transform?: (value: T[keyof T]) => unknown
}>

export function buildUpdateParams<T extends object>(
  input: Partial<T>,
  fieldMapping: FieldMapping<T>,
): { fields: string[]; values: unknown[] } | null {
  const fields: string[] = []
  const values: unknown[] = []

  for (const { key, column, transform } of fieldMapping) {
    if (!(key in input) || input[key] === undefined) continue

    const raw = input[key]
    const value = transform ? transform(raw) : raw

    fields.push(`${column} = ?`)
    values.push(value)
  }

  if (fields.length === 0) return null

  fields.push('updated_at = CURRENT_TIMESTAMP')
  return { fields, values }
}
