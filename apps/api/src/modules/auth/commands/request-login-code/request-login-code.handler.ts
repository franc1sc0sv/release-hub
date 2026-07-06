import { Logger } from '@nestjs/common'
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
  private readonly logger = new Logger(RequestLoginCodeHandler.name)

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
      this.logger.warn(`login code skipped: no account for ${command.email}`)
      return true
    }

    const cooldownSeconds = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60)
    const lastCreatedAt = await this.authRepository.findLastCodeCreatedAt(user.id, tx)

    if (lastCreatedAt && Date.now() - lastCreatedAt.getTime() < cooldownSeconds * 1000) {
      this.logger.warn(`login code skipped: resend cooldown active for ${command.email}`)
      return true
    }

    const maxCodesPerHour = Number(process.env.OTP_MAX_CODES_PER_HOUR ?? 5)
    const recentCount = await this.authRepository.countRecentCodes(user.id, 60, tx)

    if (recentCount >= maxCodesPerHour) {
      this.logger.warn(`login code skipped: hourly cap (${maxCodesPerHour}) reached for ${command.email}`)
      return true
    }

    const code = randomInt(100000, 1000000).toString().padStart(6, '0')
    const codeHash = await bcrypt.hash(code, 10)
    const ttlMinutes = Number(process.env.OTP_CODE_TTL_MINUTES ?? 10)
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000)

    await this.authRepository.createLoginCode({ userId: user.id, codeHash, expiresAt }, tx)

    this.logger.log(`login code generated for ${command.email}, dispatching email`)
    events.push(new LoginCodeRequestedEvent(user.id, user.email, code, user.name))

    return true
  }
}
