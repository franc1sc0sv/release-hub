import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { FlagsmithWebhookController } from './controllers/flagsmith-webhook.controller'
import { GithubWebhookController } from './controllers/github-webhook.controller'
import { IWebhookProjectRepository } from './interfaces/webhook-project.repository'
import { WebhookProjectRepository } from './repositories/webhook-project.repository'

@Module({
  imports: [CqrsModule],
  controllers: [FlagsmithWebhookController, GithubWebhookController],
  providers: [{ provide: IWebhookProjectRepository, useClass: WebhookProjectRepository }],
})
export class WebhooksModule {}
