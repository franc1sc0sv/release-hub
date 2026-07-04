export function stringifyFlagsmithValue(value: string | number | boolean | null | undefined): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  return String(value)
}
