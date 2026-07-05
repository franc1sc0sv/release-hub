import type { ReactNode } from 'react'
import { Github, type LucideIcon } from 'lucide-react'
import { GithubIntegrationPanel } from '../components/GithubIntegrationPanel'

export interface OrgIntegrationSectionDef {
  slug: string
  labelKey: string
  descriptionKey: string
  icon: LucideIcon
  render: () => ReactNode
}

export const ORG_INTEGRATION_SECTIONS = [
  {
    slug: 'github',
    labelKey: 'integrationsNav.github',
    descriptionKey: 'integrationsNavDescriptions.github',
    icon: Github,
    render: () => <GithubIntegrationPanel />,
  },
] as const satisfies readonly OrgIntegrationSectionDef[]

export const DEFAULT_ORG_INTEGRATION_SLUG = ORG_INTEGRATION_SECTIONS[0].slug
