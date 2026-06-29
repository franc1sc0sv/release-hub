export const ClientAvailabilityKey = {
  IN_DEVELOPMENT: 'in_development',
  BUILT_NOT_ON: 'built_not_on',
  IN_FINAL_TESTING: 'in_final_testing',
  AVAILABLE_NOW: 'available_now',
  FIRST_PART_AVAILABLE: 'first_part_available',
  DELAYED: 'delayed',
  INTERNAL_ONLY: 'internal_only',
} as const

export type ClientAvailabilityKey = (typeof ClientAvailabilityKey)[keyof typeof ClientAvailabilityKey]
