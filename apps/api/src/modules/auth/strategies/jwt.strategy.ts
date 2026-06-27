import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
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
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
