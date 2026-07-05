import { useEffect, type ReactNode } from 'react'
import { useQuery } from '@apollo/client/react'
import {
  defineAbilityFor,
  OrgRole,
  type IOrgMembership,
} from '@release-hub/shared'
import { useSetAbility } from './ability.context'
import { useAuth } from './auth.context'
import { MY_ORGANIZATIONS } from '@/features/organization/graphql/organization.operations'
import type { OrgRole as GqlOrgRole } from '@/generated/graphql'

const ORG_ROLE_MAP: Record<GqlOrgRole, OrgRole> = {
  owner: OrgRole.OWNER,
  member: OrgRole.MEMBER,
  viewer: OrgRole.VIEWER,
}

interface OrgAbilitySyncProps {
  children: ReactNode
}

export function OrgAbilitySync({ children }: OrgAbilitySyncProps) {
  const { user } = useAuth()
  const setAbility = useSetAbility()

  const { data } = useQuery(MY_ORGANIZATIONS, {
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => {
    if (!user || !data) return

    const memberships: IOrgMembership[] = data.myOrganizations.map((o) => ({
      organizationId: o.id,
      role: ORG_ROLE_MAP[o.role],
    }))

    setAbility(defineAbilityFor(memberships))
  }, [user, data, setAbility])

  return <>{children}</>
}
