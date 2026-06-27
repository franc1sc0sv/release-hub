import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UnauthenticatedException } from '../errors'

@Injectable()
export class JwtRestAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest()
  }

  handleRequest<T>(err: Error | null, user: T | false): T {
    if (err || !user) throw new UnauthenticatedException()
    return user
  }
}
