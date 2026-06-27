import type { UserRole } from '@release-hub/shared'

export interface IJwtUser {
  id: string
  role: UserRole
  email: string
}
