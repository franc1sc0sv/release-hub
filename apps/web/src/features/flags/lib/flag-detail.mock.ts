export type FlagEnvironmentState = 'on' | 'off'

export interface FlagEnvironmentRollout {
  name: string
  state: FlagEnvironmentState
}

export interface FlagTimelineEvent {
  id: string
  title: string
  date: string
  meta?: string
  source: 'release-hub' | 'code-github' | 'flagsmith-webhook' | 'release'
  isNow?: boolean
}

export interface FlagBranchPresence {
  name: string
  since: string
}

export interface FlagLinkedFeature {
  name: string
  statusLabel: string
}

export interface FlagReleaseAppearance {
  version: string
  status: 'deployed' | 'merged'
  date: string
  prNumber: number
}

export interface FlagPullRequestChange {
  number: number
  title: string
  author: string
  date: string
  file: string
  changeType: 'added' | 'modified'
}

export interface FlagDetail {
  key: string
  description: string
  tags: string[]
  statusLabel: string
  delivery: {
    version: string
    inMainDays: number
  }
  rollout: FlagEnvironmentRollout[]
  verdict: {
    title: string
    subVersion: string
    subDays: number
    snoozedUntil: string
  }
  timeline: FlagTimelineEvent[]
  branches: FlagBranchPresence[]
  linkedFeature: FlagLinkedFeature
  releases: FlagReleaseAppearance[]
  pullRequests: FlagPullRequestChange[]
}

export const flagDetailMock: FlagDetail = {
  key: 'checkout_v2_enabled',
  description:
    'Gates the rebuilt one-page checkout. Bucketed by identity; not switched on in the release-target environment until QA sign-off.',
  tags: ['checkout', 'experiment', 'protected'],
  statusLabel: 'Awaiting enable',
  delivery: {
    version: 'v1.4.0',
    inMainDays: 6,
  },
  rollout: [
    { name: 'dev', state: 'on' },
    { name: 'qa', state: 'on' },
    { name: 'staging', state: 'off' },
    { name: 'release-target', state: 'off' },
  ],
  verdict: {
    title: 'Live in the release-target environment, but still switched off',
    subVersion: 'v1.4.0',
    subDays: 6,
    snoozedUntil: 'Jul 5',
  },
  timeline: [
    {
      id: 'still-off-now',
      title: 'Still off in the release-target env — 6 days after merge to main',
      date: 'now · Jun 30',
      source: 'release-hub',
      isNow: true,
    },
    {
      id: 'reminder-snoozed',
      title: 'Reminder snoozed until Jul 5',
      date: 'Jun 28',
      meta: 'by alice',
      source: 'release-hub',
    },
    {
      id: 'reminder-sent',
      title: 'Reminder sent — merged to main, still off',
      date: 'Jun 28',
      meta: 'delivered to 3 members · in-app, email, slack',
      source: 'release-hub',
    },
    {
      id: 'deployed-v1-4-0',
      title: 'Deployed in Release v1.4.0',
      date: 'Jun 26',
      meta: 'appeared in main',
      source: 'release',
    },
    {
      id: 'modified-pr-339',
      title: 'Modified in PR #339 — fix: checkout v2 edge cases',
      date: 'Jun 20',
      meta: 'by ben · src/checkout/CheckoutPage.tsx',
      source: 'code-github',
    },
    {
      id: 'referenced-pr-339',
      title: 'Referenced in PR #339 — usage in CheckoutPage.tsx',
      date: 'Jun 20',
      meta: 'flag reference detected during PR scan',
      source: 'code-github',
    },
    {
      id: 'enabled-qa',
      title: 'Enabled in qa',
      date: 'Jun 12',
      source: 'flagsmith-webhook',
    },
    {
      id: 'enabled-dev',
      title: 'Enabled in dev',
      date: 'Jun 11',
      source: 'flagsmith-webhook',
    },
    {
      id: 'shipped-v1-3-0',
      title: 'Shipped in Release v1.3.0',
      date: 'Jun 11',
      meta: 'merged',
      source: 'release',
    },
    {
      id: 'linked-feature',
      title: 'Linked to feature Checkout Redesign',
      date: 'Jun 10',
      meta: 'auto-linked from PR #312',
      source: 'release-hub',
    },
    {
      id: 'appeared-branch',
      title: 'Appeared in branch feature/checkout-v2',
      date: 'Jun 10',
      source: 'code-github',
    },
    {
      id: 'added-pr-312',
      title: 'Added in PR #312 — feat: checkout v2 behind flag',
      date: 'Jun 10',
      meta: 'by alice · key added to src/config/flags.ts',
      source: 'code-github',
    },
  ],
  branches: [
    { name: 'main', since: 'Jun 26' },
    { name: 'develop', since: 'Jun 10' },
    { name: 'feature/checkout-v2', since: 'Jun 10' },
  ],
  linkedFeature: {
    name: 'Checkout Redesign',
    statusLabel: 'live in staging',
  },
  releases: [
    { version: 'v1.4.0', status: 'deployed', date: 'Jun 26', prNumber: 339 },
    { version: 'v1.3.0', status: 'merged', date: 'Jun 11', prNumber: 312 },
  ],
  pullRequests: [
    {
      number: 312,
      title: 'feat: checkout v2 behind flag',
      author: 'alice',
      date: 'Jun 10',
      file: 'flags.ts',
      changeType: 'added',
    },
    {
      number: 339,
      title: 'fix: checkout v2 edge cases',
      author: 'ben',
      date: 'Jun 20',
      file: 'CheckoutPage.tsx',
      changeType: 'modified',
    },
  ],
}
