import { CommandHandler } from '@nestjs/cqrs'
import { randomInt } from 'node:crypto'
import * as bcrypt from 'bcryptjs'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IAuthRepository } from '../../repositories/auth.repository.abstract'
import { LoginCodeRequestedEvent } from '../../events/login-code-requested.event'
import { RequestLoginCodeCommand } from './request-login-code.command'

@CommandHandler(RequestLoginCodeCommand)
export class RequestLoginCodeHandler extends BaseCommandHandler<RequestLoginCodeCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly authRepository: IAuthRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: RequestLoginCodeCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<boolean> {
    const user = await this.authRepository.findByEmail(command.email, tx)

    if (!user) {
      return true
    }

    const cooldownSeconds = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60)
    const lastCreatedAt = await this.authRepository.findLastCodeCreatedAt(user.id, tx)

    if (lastCreatedAt && Date.now() - lastCreatedAt.getTime() < cooldownSeconds * 1000) {
      return true
    }

    const maxCodesPerHour = Number(process.env.OTP_MAX_CODES_PER_HOUR ?? 3)
    const recentCount = await this.authRepository.countRecentCodes(user.id, 60, tx)

    if (recentCount >= maxCodesPerHour) {
      return true
    }

    const code = randomInt(100000, 1000000).toString().padStart(6, '0')
    const codeHash = await bcrypt.hash(code, 10)
    const ttlMinutes = Number(process.env.OTP_CODE_TTL_MINUTES ?? 10)
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000)

    await this.authRepository.createLoginCode({ userId: user.id, codeHash, expiresAt }, tx)

    events.push(new LoginCodeRequestedEvent(user.id, user.email, code, user.name))

    return true
  }
}
