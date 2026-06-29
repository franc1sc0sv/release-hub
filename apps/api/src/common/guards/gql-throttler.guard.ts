import { Injectable } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'
import { GqlExecutionContext } from '@nestjs/graphql'
import type { Request, Response } from 'express'

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context)
    const ctx = gqlContext.getContext<{ req?: { res?: Response } }>()
    if (!ctx.req?.res) {
      return true
    }
    return super.canActivate(context)
  }

  getRequestResponse(context: ExecutionContext): { req: Request; res: Response } {
    const gqlContext = GqlExecutionContext.create(context)
    const ctx = gqlContext.getContext<{ req: Request & { res: Response } }>()
    return { req: ctx.req, res: ctx.req.res }
  }
}
