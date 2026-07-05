import type { GithubAuthMode } from '@/generated/graphql'

export const GithubAuthModeValue = {
  installation: 'installation',
  oauth: 'oauth',
} as const satisfies Record<GithubAuthMode, GithubAuthMode>
