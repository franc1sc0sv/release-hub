import { CommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { EmailAlreadyExistsException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IAuthRepository } from '../../repositories/auth.repository.abstract'
import type { IAuthTokens } from '../../interfaces/auth.interfaces'
import { issueTokens } from '../../auth.tokens'
import { RegisterCommand } from './register.command'

@CommandHandler(RegisterCommand)
export class RegisterHandler extends BaseCommandHandler<RegisterCommand, IAuthTokens> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: RegisterCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IAuthTokens> {
    const existing = await this.authRepository.findByEmail(command.email, tx)

    if (existing) {
      throw new EmailAlreadyExistsException()
    }

    const hashedPassword = await bcrypt.hash(command.password, 10)

    const user = await this.authRepository.createUser(
      {
        email: command.email,
        password: hashedPassword,
        name: command.name,
      },
      tx,
    )

    return issueTokens(this.jwtService, this.authRepository, tx, user)
  }
}
