import { Injectable } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'
import { GqlExecutionContext } from '@nestjs/graphql'
import type { Request, Response } from 'express'

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): { req: Request; res: Response } {
    const gqlContext = GqlExecutionContext.create(context)
    const ctx = gqlContext.getContext<{ req: Request & { res: Response } }>()
    return { req: ctx.req, res: ctx.req.res }
  }
}
