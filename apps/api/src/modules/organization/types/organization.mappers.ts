import type {
  IUserOrganization,
  IOrganizationMemberProfile,
} from '../interfaces/organization.interfaces'
import { OrganizationType } from './organization.type'
import { OrganizationMemberType } from './organization-member.type'

export function toOrganizationType(organization: IUserOrganization): OrganizationType {
  const out = new OrganizationType()
  out.id = organization.id
  out.name = organization.name
  out.slug = organization.slug
  out.role = organization.role
  out.githubConnected = organization.githubConnected
  return out
}

export function toOrganizationMemberType(
  profile: IOrganizationMemberProfile,
): OrganizationMemberType {
  const out = new OrganizationMemberType()
  out.id = profile.id
  out.userId = profile.userId
  out.organizationId = profile.organizationId
  out.role = profile.role
  out.name = profile.name
  out.email = profile.email
  out.avatarUrl = profile.avatarUrl
  out.createdAt = profile.createdAt
  out.updatedAt = profile.updatedAt
  return out
}
