import type { ProjectRole } from '../../../../common/types/project-role.enum'

export class ChangeMemberRoleCommand {
  constructor(
    readonly actorId: string,
    readonly membershipId: string,
    readonly newRole: ProjectRole,
  ) {}
}
