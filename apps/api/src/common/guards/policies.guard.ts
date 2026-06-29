import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { defineGateAbility } from '@release-hub/shared'
import {
  CHECK_POLICIES_KEY,
  PolicyHandlerFn,
} from '../decorators/check-policies.decorator'
import { UnauthenticatedException, ForbiddenException } from '../errors'
import type { IJwtUser } from '../types'

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const policyHandlers =
      this.reflector.get<PolicyHandlerFn[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) ?? []

    if (policyHandlers.length === 0) return true

    const ctx = GqlExecutionContext.create(context)
    const user: IJwtUser | undefined = ctx.getContext().req.user

    if (!user) throw new UnauthenticatedException()

    const ability = defineGateAbility()
    if (!policyHandlers.every((handler) => handler(ability))) {
      throw new ForbiddenException()
    }
    return true
  }
}
