import { CommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IAuthRepository } from '../../repositories/auth.repository.abstract'
import { TokenType } from '../../interfaces/auth.interfaces'
import type { ITokenPayload } from '../../interfaces/auth.interfaces'
import { LogoutCommand } from './logout.command'

@CommandHandler(LogoutCommand)
export class LogoutHandler extends BaseCommandHandler<LogoutCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: LogoutCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
    let payload: ITokenPayload

    try {
      payload = this.jwtService.verify<ITokenPayload>(command.refreshToken)
    } catch {
      return true
    }

    if (payload.type === TokenType.REFRESH && payload.jti) {
      await this.authRepository.revokeRefreshToken(payload.jti, tx)
    }

    return true
  }
}
