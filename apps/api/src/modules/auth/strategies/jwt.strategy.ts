import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { TokenType } from '../interfaces/auth.interfaces'
import type { ITokenPayload } from '../interfaces/auth.interfaces'
import type { IJwtUser } from '../../../common/types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    })
  }

  validate(payload: ITokenPayload): IJwtUser {
    if (payload.type !== TokenType.ACCESS) {
      throw new UnauthorizedException()
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
