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
import type { IAuthTokens } from '../../interfaces/auth.interfaces'
import { DUMMY_HASH } from '../../auth.constants'
import { issueTokens } from '../../auth.tokens'
import { LoginWithCodeCommand } from './login-with-code.command'

@CommandHandler(LoginWithCodeCommand)
export class LoginWithCodeHandler extends BaseCommandHandler<LoginWithCodeCommand, IAuthTokens> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: LoginWithCodeCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IAuthTokens> {
    const user = await this.authRepository.findByEmail(command.email, tx)

    if (!user) {
      await bcrypt.compare(command.code, DUMMY_HASH)
      throw new InvalidCredentialsException()
    }

    const record = await this.authRepository.findActiveLoginCode(user.id, tx)

    if (!record) {
      await bcrypt.compare(command.code, DUMMY_HASH)
      throw new InvalidCredentialsException()
    }

    const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS ?? 5)
    const reserved = await this.authRepository.reserveLoginCodeAttempt(record.id, maxAttempts, tx)

    if (!reserved) {
      throw new InvalidCredentialsException()
    }

    const match = await bcrypt.compare(command.code, record.codeHash)

    if (!match) {
      throw new InvalidCredentialsException()
    }

    await this.authRepository.consumeLoginCode(record.id, tx)

    return issueTokens(this.jwtService, this.authRepository, tx, user)
  }
}
