import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { IMailService } from '../../../../common/mail/mail.abstract'
import { LoginCodeRequestedEvent } from '../login-code-requested.event'

@Injectable()
export class SendLoginCodeHandler {
  private readonly logger = new Logger(SendLoginCodeHandler.name)

  constructor(private readonly mailService: IMailService) {}

  @OnEvent('auth.login-code.requested')
  async onLoginCodeRequested(event: LoginCodeRequestedEvent): Promise<void> {
    try {
      await this.mailService.sendLoginCode(event.email, event.code, event.userName)
    } catch (error) {
      this.logger.error(
        `Failed to send login code to ${event.email}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
