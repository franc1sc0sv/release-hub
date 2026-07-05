import type { ReactNode } from 'react'
import { Plug, Bell, Flag, Tags, type LucideIcon } from 'lucide-react'
import { ConnectionsSection } from '../components/connections-section'
import { NotificationPreferencesSection } from '../components/notification-preferences-section'
import { FlagTrackingSection } from '../components/flag-tracking-section'
import { TagsSection } from '../components/tags-section'

export interface SettingsSectionDef {
  slug: string
  labelKey: string
  descriptionKey: string
  icon: LucideIcon
  render: (projectId: string) => ReactNode
}

export const SETTINGS_SECTIONS = [
  {
    slug: 'connections',
    labelKey: 'sections.connections',
    descriptionKey: 'descriptions.connections',
    icon: Plug,
    render: (projectId) => <ConnectionsSection projectId={projectId} />,
  },
  {
    slug: 'notifications',
    labelKey: 'sections.notifications',
    descriptionKey: 'descriptions.notifications',
    icon: Bell,
    render: (projectId) => <NotificationPreferencesSection projectId={projectId} />,
  },
  {
    slug: 'flag-tracking',
    labelKey: 'sections.flagTracking',
    descriptionKey: 'descriptions.flagTracking',
    icon: Flag,
    render: (projectId) => <FlagTrackingSection projectId={projectId} />,
  },
  {
    slug: 'tags',
    labelKey: 'sections.tags',
    descriptionKey: 'descriptions.tags',
    icon: Tags,
    render: (projectId) => <TagsSection projectId={projectId} />,
  },
] as const satisfies readonly SettingsSectionDef[]

export const DEFAULT_SETTINGS_SLUG = SETTINGS_SECTIONS[0].slug
