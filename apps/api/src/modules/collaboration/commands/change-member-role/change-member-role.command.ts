import type { OrgRole } from '@release-hub/shared'

export class ChangeMemberRoleCommand {
  constructor(
    readonly actorId: string,
    readonly membershipId: string,
    readonly newRole: OrgRole,
  ) {}
}
