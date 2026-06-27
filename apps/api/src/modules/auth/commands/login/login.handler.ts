import { CommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { InvalidCredentialsException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IAuthRepository } from '../../repositories/auth.repository.abstract'
import type { IAuthTokens, ITokenPayload } from '../../interfaces/auth.interfaces'
import { LoginCommand } from './login.command'

@CommandHandler(LoginCommand)
export class LoginHandler extends BaseCommandHandler<LoginCommand, IAuthTokens> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: LoginCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IAuthTokens> {
    const user = await this.authRepository.findByEmail(command.email, tx)

    if (!user) {
      throw new InvalidCredentialsException()
    }

    const passwordValid = await bcrypt.compare(command.password, user.password)

    if (!passwordValid) {
      throw new InvalidCredentialsException()
    }

    const payload: ITokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' })

    return { accessToken, refreshToken }
  }
}
