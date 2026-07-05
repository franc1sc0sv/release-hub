import { Body, Controller, Headers, HttpCode, Param, Post, Req, UnauthorizedException } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { CommandBus } from '@nestjs/cqrs'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { IWebhookProjectRepository } from '../interfaces/webhook-project.repository'
import { verifyHmacSha256 } from '../crypto/verify-hmac-sha256'
import type { IRawBodyRequest } from '../interfaces/raw-body-request.interface'
import type { IGithubAppWebhookPayload } from '../interfaces/github-app-webhook.interfaces'
import { HandleGithubDeploymentWebhookCommand } from '../../release/commands/handle-github-deployment-webhook/handle-github-deployment-webhook.command'
import type { IGithubDeploymentStatusWebhookPayload } from '../../release/interfaces/github-deployment-webhook.interfaces'
import { HandleGithubPushWebhookCommand } from '../../repo-ops/commands/handle-github-push-webhook/handle-github-push-webhook.command'
import { HandleGithubRefWebhookCommand, GithubRefAction } from '../../repo-ops/commands/handle-github-ref-webhook/handle-github-ref-webhook.command'
import { HandleGithubPullRequestWebhookCommand } from '../../repo-ops/commands/handle-github-pull-request-webhook/handle-github-pull-request-webhook.command'
import { ReconcileGithubInstallationCommand } from '../../github-app/commands/reconcile-github-installation/reconcile-github-installation.command'

const GITHUB_WEBHOOK_THROTTLE = { default: { ttl: 60_000, limit: 30 } }
const SHA256_PREFIX = 'sha256='
const DEPLOYMENT_STATUS_EVENT = 'deployment_status'
const PUSH_EVENT = 'push'
const CREATE_EVENT = 'create'
const DELETE_EVENT = 'delete'
const PULL_REQUEST_EVENT = 'pull_request'
const INSTALLATION_EVENT = 'installation'
const INSTALLATION_REPOSITORIES_EVENT = 'installation_repositories'

@Controller('webhooks/github')
export class GithubWebhookController {
  constructor(
    private readonly db: IDatabaseService,
    private readonly webhookProjectRepository: IWebhookProjectRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Throttle(GITHUB_WEBHOOK_THROTTLE)
  @Post()
  @HttpCode(202)
  async handleApp(
    @Headers('x-hub-signature-256') signatureHeader: string | undefined,
    @Headers('x-github-event') eventType: string | undefined,
    @Body() payload: IGithubAppWebhookPayload,
    @Req() req: IRawBodyRequest,
  ): Promise<{ received: boolean }> {
    const secret = process.env.GITHUB_APP_WEBHOOK_SECRET
    if (!secret || !signatureHeader || !req.rawBody) {
      throw new UnauthorizedException()
    }

    if (!signatureHeader.startsWith(SHA256_PREFIX)) {
      throw new UnauthorizedException()
    }

    const signature = signatureHeader.slice(SHA256_PREFIX.length)
    if (!verifyHmacSha256(req.rawBody, secret, signature)) {
      throw new UnauthorizedException()
    }

    await this.routeAppEvent(eventType, payload)
    return { received: true }
  }

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

  private async routeAppEvent(
    eventType: string | undefined,
    payload: IGithubAppWebhookPayload,
  ): Promise<void> {
    switch (eventType) {
      case DEPLOYMENT_STATUS_EVENT:
        return this.dispatchDeployment(payload)
      case PUSH_EVENT: {
        const projectId = await this.resolveProjectId(payload)
        if (projectId) {
          await this.commandBus.execute(new HandleGithubPushWebhookCommand(projectId, payload))
        }
        return
      }
      case CREATE_EVENT: {
        const projectId = await this.resolveProjectId(payload)
        if (projectId) {
          await this.commandBus.execute(
            new HandleGithubRefWebhookCommand(projectId, GithubRefAction.CREATED, payload),
          )
        }
        return
      }
      case DELETE_EVENT: {
        const projectId = await this.resolveProjectId(payload)
        if (projectId) {
          await this.commandBus.execute(
            new HandleGithubRefWebhookCommand(projectId, GithubRefAction.DELETED, payload),
          )
        }
        return
      }
      case PULL_REQUEST_EVENT: {
        const projectId = await this.resolveProjectId(payload)
        if (projectId) {
          await this.commandBus.execute(new HandleGithubPullRequestWebhookCommand(projectId, payload))
        }
        return
      }
      case INSTALLATION_EVENT:
      case INSTALLATION_REPOSITORIES_EVENT: {
        const installationId = payload.installation?.id
        if (installationId != null) {
          await this.commandBus.execute(
            new ReconcileGithubInstallationCommand(installationId, payload.action ?? ''),
          )
        }
        return
      }
      default:
        return
    }
  }

  private async dispatchDeployment(payload: IGithubAppWebhookPayload): Promise<void> {
    const projectId = await this.resolveProjectId(payload)
    if (!projectId) return
    if (!payload.deployment || !payload.deployment_status || !payload.repository) return

    const deploymentPayload: IGithubDeploymentStatusWebhookPayload = {
      action: payload.action ?? '',
      deployment: payload.deployment,
      deployment_status: payload.deployment_status,
      repository: payload.repository,
    }
    await this.commandBus.execute(new HandleGithubDeploymentWebhookCommand(projectId, deploymentPayload))
  }

  private async resolveProjectId(payload: IGithubAppWebhookPayload): Promise<string | null> {
    const fullName = payload.repository?.full_name
    const installationId = payload.installation?.id
    if (!fullName || installationId == null) return null

    return this.db.$transaction((tx) =>
      this.webhookProjectRepository.findProjectByRepoAndInstallation(fullName, installationId, tx),
    )
  }
}
