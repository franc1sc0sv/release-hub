export const isAiEnabled = (): boolean =>
  process.env.AI_ENABLED != null
    ? process.env.AI_ENABLED === 'true'
    : process.env.NODE_ENV === 'development'
