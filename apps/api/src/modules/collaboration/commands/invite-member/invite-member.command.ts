import type { OrgRole } from '@release-hub/shared'

export class InviteMemberCommand {
  constructor(
    readonly actorId: string,
    readonly organizationId: string,
    readonly email: string,
    readonly role: OrgRole,
  ) {}
}
