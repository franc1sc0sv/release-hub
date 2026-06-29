import { useEffect, type ReactNode } from 'react'
import { useQuery } from '@apollo/client/react'
import {
  defineAbilityFor,
  ProjectRole,
  type IProjectMembership,
} from '@release-hub/shared'
import { useSetAbility } from './ability.context'
import { useAuth } from './auth.context'
import { useProject } from './project.context'
import { LIST_MEMBERS } from '@/features/collaboration/graphql/collaboration.operations'
import type { ProjectRole as GqlProjectRole } from '@/generated/graphql'

const PROJECT_ROLE_MAP: Record<GqlProjectRole, IProjectMembership['role']> = {
  OWNER: ProjectRole.OWNER,
  MEMBER: ProjectRole.MEMBER,
  VIEWER: ProjectRole.VIEWER,
}

interface ProjectAbilitySyncProps {
  children: ReactNode
}

export function ProjectAbilitySync({ children }: ProjectAbilitySyncProps) {
  const { user } = useAuth()
  const { activeProject } = useProject()
  const setAbility = useSetAbility()

  const { data } = useQuery(LIST_MEMBERS, {
    variables: { projectId: activeProject?.id ?? '' },
    skip: !activeProject,
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => {
    if (!user || !activeProject || !data) return

    const memberships: IProjectMembership[] = data.listMembers.map((m) => ({
      projectId: m.projectId,
      role: PROJECT_ROLE_MAP[m.role],
    }))

    setAbility(defineAbilityFor(memberships))
  }, [user, activeProject, data, setAbility])

  return <>{children}</>
}
