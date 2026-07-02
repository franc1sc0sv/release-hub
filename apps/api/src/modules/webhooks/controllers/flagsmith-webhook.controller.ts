import { Controller, Headers, HttpCode, Param, Post, Req, UnauthorizedException } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { IWebhookProjectRepository } from '../interfaces/webhook-project.repository'
import { verifyHmacSha256 } from '../crypto/verify-hmac-sha256'
import type { IRawBodyRequest } from '../interfaces/raw-body-request.interface'

const FLAGSMITH_WEBHOOK_THROTTLE = { default: { ttl: 60_000, limit: 30 } }

@Controller('webhooks/flagsmith')
export class FlagsmithWebhookController {
  constructor(
    private readonly db: IDatabaseService,
    private readonly webhookProjectRepository: IWebhookProjectRepository,
  ) {}

  @Throttle(FLAGSMITH_WEBHOOK_THROTTLE)
  @Post(':projectId')
  @HttpCode(202)
  async handle(
    @Param('projectId') projectId: string,
    @Headers('x-flagsmith-signature') signature: string | undefined,
    @Req() req: IRawBodyRequest,
  ): Promise<{ received: boolean }> {
    const secrets = await this.db.$transaction((tx) =>
      this.webhookProjectRepository.findWebhookSecrets(projectId, tx),
    )

    if (!secrets?.flagsmithWebhookSecret || !signature || !req.rawBody) {
      throw new UnauthorizedException()
    }

    const isValid = verifyHmacSha256(req.rawBody, secrets.flagsmithWebhookSecret, signature)
    if (!isValid) {
      throw new UnauthorizedException()
    }

    return { received: true }
  }
}
