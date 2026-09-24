const PRODUCTION_ENVIRONMENT_TERM = 'prod'
const DEFAULT_VISIBLE_ENVIRONMENT_TERMS = ['demo', 'production'] as const

export function isProductionEnvironment(name: string): boolean {
  return name.toLowerCase().includes(PRODUCTION_ENVIRONMENT_TERM)
}

export function isDefaultVisibleEnvironment(name: string): boolean {
  const lowered = name.toLowerCase()
  return DEFAULT_VISIBLE_ENVIRONMENT_TERMS.some((term) => lowered.includes(term))
}
