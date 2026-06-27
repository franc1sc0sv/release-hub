import { SetMetadata } from '@nestjs/common'
import { type AppAbility, type Action, type Subject } from '@release-hub/shared'

export interface PolicyHandler {
  handle(ability: AppAbility): boolean
}

export type PolicyHandlerFn = (ability: AppAbility) => boolean

export const CHECK_POLICIES_KEY = 'check_policies'

export const CheckPolicies = (...handlers: PolicyHandlerFn[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers)

// Convenience: single action + subject shorthand
export const Can = (action: Action, subject: Subject) =>
  CheckPolicies((ability) => ability.can(action, subject))
