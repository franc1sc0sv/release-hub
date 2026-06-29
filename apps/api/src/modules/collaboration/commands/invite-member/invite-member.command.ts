import type { ProjectRole } from '../../../../common/types/project-role.enum'

export class InviteMemberCommand {
  constructor(
    readonly actorId: string,
    readonly projectId: string,
    readonly email: string,
    readonly role: ProjectRole,
  ) {}
}
