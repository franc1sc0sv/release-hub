import type { GetFlagsQuery } from '@/generated/graphql'

type FlagItem = GetFlagsQuery['getFlags']['items'][number]

export function isParityBreak(flag: FlagItem): boolean {
  const staging = flag.environments.find((e) => e.name.toLowerCase().includes('staging'))
  const production = flag.environments.find((e) => e.name.toLowerCase().includes('prod'))
  if (!staging || !production) return false
  return production.enabled && !staging.enabled
}

export function hasParityBreak(flags: FlagItem[]): boolean {
  return flags.some(isParityBreak)
}
