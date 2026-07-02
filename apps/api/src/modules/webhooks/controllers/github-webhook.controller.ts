import { Controller, Headers, HttpCode, Param, Post, Req, UnauthorizedException } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { IWebhookProjectRepository } from '../interfaces/webhook-project.repository'
import { verifyHmacSha256 } from '../crypto/verify-hmac-sha256'
import type { IRawBodyRequest } from '../interfaces/raw-body-request.interface'

const GITHUB_WEBHOOK_THROTTLE = { default: { ttl: 60_000, limit: 30 } }
const SHA256_PREFIX = 'sha256='

@Controller('webhooks/github')
export class GithubWebhookController {
  constructor(
    private readonly db: IDatabaseService,
    private readonly webhookProjectRepository: IWebhookProjectRepository,
  ) {}

  @Throttle(GITHUB_WEBHOOK_THROTTLE)
  @Post(':projectId')
  @HttpCode(202)
  async handle(
    @Param('projectId') projectId: string,
    @Headers('x-hub-signature-256') signatureHeader: string | undefined,
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

    return { received: true }
  }
}
