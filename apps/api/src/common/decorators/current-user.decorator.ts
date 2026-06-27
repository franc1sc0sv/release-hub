import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import type { IJwtUser } from '../types'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IJwtUser => {
    const gqlCtx = GqlExecutionContext.create(ctx)
    return gqlCtx.getContext().req.user
  },
)
