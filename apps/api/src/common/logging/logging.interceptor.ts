import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { OperationTypeNode } from 'graphql'
import type { GraphQLResolveInfo } from 'graphql'
import { Observable, tap } from 'rxjs'
import { ILogger } from './logging.abstract'
import { LogEvent } from './log-event.enum'

type RequestContext = { req?: { user?: { id?: string } } }

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: ILogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<GqlContextType>() !== 'graphql') {
      return next.handle()
    }

    const gqlContext = GqlExecutionContext.create(context)
    const info = gqlContext.getInfo<GraphQLResolveInfo>()

    if (info.path.prev !== undefined) {
      return next.handle()
    }

    const request = gqlContext.getContext<RequestContext>().req
    const fields = {
      operation: info.fieldName,
      operationType: info.operation.operation,
      userId: request?.user?.id ?? null,
    }

    if (info.operation.operation === OperationTypeNode.SUBSCRIPTION) {
      this.logger.info(fields, LogEvent.SUBSCRIPTION_START)
      return next.handle().pipe(
        tap({
          error: (error: unknown) =>
            this.logger.error({ ...fields, err: error }, LogEvent.SUBSCRIPTION_ERROR),
        }),
      )
    }

    const start = Date.now()
    return next.handle().pipe(
      tap({
        next: () =>
          this.logger.info(
            { ...fields, durationMs: Date.now() - start },
            LogEvent.OPERATION_SUCCESS,
          ),
        error: (error: unknown) =>
          this.logger.error(
            { ...fields, durationMs: Date.now() - start, err: error },
            LogEvent.OPERATION_ERROR,
          ),
      }),
    )
  }
}
