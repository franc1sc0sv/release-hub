const DEFAULT_INVITATION_TTL_DAYS = 7

export const INVITATION_TTL_DAYS = (): number => {
  const raw = process.env.INVITATION_TTL_DAYS
  if (!raw) return DEFAULT_INVITATION_TTL_DAYS
  const parsed = parseInt(raw, 10)
  return isNaN(parsed) || parsed <= 0 ? DEFAULT_INVITATION_TTL_DAYS : parsed
}
