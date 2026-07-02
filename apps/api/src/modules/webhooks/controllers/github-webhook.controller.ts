import { Body, Controller, Headers, HttpCode, Param, Post, Req, UnauthorizedException } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { CommandBus } from '@nestjs/cqrs'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { IWebhookProjectRepository } from '../interfaces/webhook-project.repository'
import { verifyHmacSha256 } from '../crypto/verify-hmac-sha256'
import type { IRawBodyRequest } from '../interfaces/raw-body-request.interface'
import { HandleGithubDeploymentWebhookCommand } from '../../release/commands/handle-github-deployment-webhook/handle-github-deployment-webhook.command'
import type { IGithubDeploymentStatusWebhookPayload } from '../../release/interfaces/github-deployment-webhook.interfaces'

const GITHUB_WEBHOOK_THROTTLE = { default: { ttl: 60_000, limit: 30 } }
const SHA256_PREFIX = 'sha256='
const DEPLOYMENT_STATUS_EVENT = 'deployment_status'

@Controller('webhooks/github')
export class GithubWebhookController {
  constructor(
    private readonly db: IDatabaseService,
    private readonly webhookProjectRepository: IWebhookProjectRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Throttle(GITHUB_WEBHOOK_THROTTLE)
  @Post(':projectId')
  @HttpCode(202)
  async handle(
    @Param('projectId') projectId: string,
    @Headers('x-hub-signature-256') signatureHeader: string | undefined,
    @Headers('x-github-event') eventType: string | undefined,
    @Body() payload: IGithubDeploymentStatusWebhookPayload,
    @Req() req: IRawBodyRequest,
  ): Promise<{ received: boolean }> {
    const secrets = await this.db.$transaction((tx) =>
      this.webhookProjectRepository.findWebhookSecrets(projectId, tx),
    )

    if (!secrets?.githubWebhookSecret || !signatureHeader || !req.rawBody) {
      throw new UnauthorizedException()
    }

    if (!signatureHeader.startsWith(SHA256_PREFIX)) {
      throw new UnauthorizedException()
    }

    const signature = signatureHeader.slice(SHA256_PREFIX.length)
    const isValid = verifyHmacSha256(req.rawBody, secrets.githubWebhookSecret, signature)
    if (!isValid) {
      throw new UnauthorizedException()
    }

    if (eventType === DEPLOYMENT_STATUS_EVENT) {
      await this.commandBus.execute(new HandleGithubDeploymentWebhookCommand(projectId, payload))
    }

    return { received: true }
  }
}
