import { CommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { AppException, ErrorCode, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IAuthRepository } from '../../repositories/auth.repository.abstract'
import { TokenType } from '../../interfaces/auth.interfaces'
import type { IAuthTokens, ITokenPayload } from '../../interfaces/auth.interfaces'
import { issueTokens } from '../../auth.tokens'
import { RefreshTokenCommand } from './refresh-token.command'

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler extends BaseCommandHandler<RefreshTokenCommand, IAuthTokens> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: RefreshTokenCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IAuthTokens> {
    let payload: ITokenPayload

    try {
      payload = this.jwtService.verify<ITokenPayload>(command.refreshToken)
    } catch {
      throw new AppException('Invalid token', ErrorCode.INVALID_TOKEN)
    }

    if (payload.type !== TokenType.REFRESH || !payload.jti) {
      throw new AppException('Invalid token', ErrorCode.INVALID_TOKEN)
    }

    const stored = await this.authRepository.findRefreshTokenById(payload.jti, tx)

    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      throw new AppException('Invalid token', ErrorCode.INVALID_TOKEN)
    }

    const user = await this.authRepository.findById(payload.sub, tx)

    if (!user) {
      throw new NotFoundException('User')
    }

    await this.authRepository.revokeRefreshToken(payload.jti, tx)

    return issueTokens(this.jwtService, this.authRepository, tx, user)
  }
}
