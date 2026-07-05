export function isAiEnabled(): boolean {
  const explicit = import.meta.env.VITE_AI_ENABLED
  if (explicit !== undefined) {
    return explicit === 'true'
  }
  return import.meta.env.DEV
}
