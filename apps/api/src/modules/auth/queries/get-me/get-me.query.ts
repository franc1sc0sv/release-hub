import type { UserRole } from '@release-hub/shared'

export class GetMeQuery {
  constructor(
    public readonly userId: string,
    public readonly role: UserRole,
  ) {}
}
