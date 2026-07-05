import type { ReactNode } from 'react'
import { Building2, Users, type LucideIcon } from 'lucide-react'
import { GeneralSection } from '../components/GeneralSection'
import { MembersSection } from '@/features/collaboration/components/members-section'

export interface OrgSettingsSectionDef {
  slug: string
  labelKey: string
  descriptionKey: string
  icon: LucideIcon
  render: () => ReactNode
}

export const ORG_SETTINGS_SECTIONS = [
  {
    slug: 'general',
    labelKey: 'settingsNav.general',
    descriptionKey: 'settingsNavDescriptions.general',
    icon: Building2,
    render: () => <GeneralSection />,
  },
  {
    slug: 'members',
    labelKey: 'settingsNav.members',
    descriptionKey: 'settingsNavDescriptions.members',
    icon: Users,
    render: () => <MembersSection />,
  },
] as const satisfies readonly OrgSettingsSectionDef[]

export const DEFAULT_ORG_SETTINGS_SLUG = ORG_SETTINGS_SECTIONS[0].slug
