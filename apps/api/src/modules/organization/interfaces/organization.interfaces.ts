import type { OrgRole } from '@release-hub/shared'

export interface IOrganization {
  id: string
  name: string
  slug: string | null
  githubInstallationId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IUserOrganization {
  id: string
  name: string
  slug: string | null
  role: OrgRole
  githubConnected: boolean
}

export interface IOrganizationMemberProfile {
  id: string
  userId: string
  organizationId: string
  role: OrgRole
  name: string
  email: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}
