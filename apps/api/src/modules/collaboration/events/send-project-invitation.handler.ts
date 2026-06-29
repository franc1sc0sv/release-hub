import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { IMailService } from '../../../common/mail/mail.abstract'
import { ProjectInvitationSentEvent } from './project-invitation-sent.event'

const WEB_APP_URL = process.env.WEB_APP_URL ?? 'http://localhost:5173'

@Injectable()
export class SendProjectInvitationHandler {
  private readonly logger = new Logger(SendProjectInvitationHandler.name)

  constructor(private readonly mailService: IMailService) {}

  @OnEvent('collaboration.invitation.sent')
  async onInvitationSent(event: ProjectInvitationSentEvent): Promise<void> {
    const acceptUrl = `${WEB_APP_URL}/invitations/accept?token=${event.acceptToken}`
    try {
      await this.mailService.sendProjectInvitation(
        event.to,
        event.inviterName,
        event.projectName,
        acceptUrl,
      )
    } catch (error) {
      this.logger.error(
        `Failed to send invitation email to ${event.to}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
