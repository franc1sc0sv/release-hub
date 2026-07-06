import { Controller, Get, Logger, Query, Res } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import type { Response } from 'express'
import { encryptToken } from '../../../common/crypto/token-cipher'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { IProjectRepository } from '../../project/interfaces/project.repository'
import { ILinearOAuthStateRepository } from '../interfaces/linear-oauth-state.repository'
import { ConnectLinearCommand } from '../commands/connect-linear/connect-linear.command'

interface ILinearStatePayload {
  sub: string
  projectId: string
  nonce: string
}

interface ILinearTokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  error?: string
}

interface ILinearViewerResponse {
  data?: {
    viewer?: {
      id: string
      name: string
    } | null
  }
  errors?: { message: string }[]
}

@Controller('auth/linear')
export class LinearAuthController {
  private readonly logger = new Logger(LinearAuthController.name)

  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly db: IDatabaseService,
    private readonly oauthStateRepository: ILinearOAuthStateRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    const webAppUrl = (process.env.WEB_APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '')
    const fallbackErrorRedirect = `${webAppUrl}/?linear=error`
    let errorRedirect = fallbackErrorRedirect

    try {
      const payload = this.jwtService.verify<ILinearStatePayload>(state)
      const userId = payload.sub
      const projectId = payload.projectId

      const consumed = await this.db.$transaction((tx) =>
        this.oauthStateRepository.consume(payload.nonce, tx),
      )
      if (!consumed) {
        this.logger.warn('linear callback: install state invalid/expired/used')
        res.redirect(fallbackErrorRedirect)
        return
      }

      const project = await this.db.$query((tx) => this.projectRepository.findById(projectId, tx))
      if (!project) {
        this.logger.error(`linear callback: project not found projectId=${projectId}`)
        res.redirect(fallbackErrorRedirect)
        return
      }

      const base = `${webAppUrl}/${project.organizationId}/${projectId}/settings/connections`
      errorRedirect = `${base}?linear=error`

      const clientId = process.env.LINEAR_CLIENT_ID!
      const clientSecret = process.env.LINEAR_CLIENT_SECRET!
      const callbackUrl =
        process.env.LINEAR_CALLBACK_URL ?? 'http://localhost:3001/auth/linear/callback'
      this.logger.log(`linear callback: exchanging code with redirect_uri=${callbackUrl}`)

      const tokenBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        code,
        grant_type: 'authorization_code',
      })

      const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenBody.toString(),
      })

      const tokenData = (await tokenResponse.json()) as ILinearTokenResponse

      if (!tokenData.access_token || tokenData.error) {
        this.logger.error(
          `linear callback: token exchange failed status=${tokenResponse.status} error=${tokenData.error ?? 'no access_token'}`,
        )
        res.redirect(errorRedirect)
        return
      }

      const viewerResponse = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        body: JSON.stringify({ query: '{ viewer { id name } }' }),
      })

      const viewerData = (await viewerResponse.json()) as ILinearViewerResponse

      if (viewerData.errors?.length || !viewerData.data?.viewer) {
        this.logger.error(
          `linear callback: viewer query failed: ${JSON.stringify(viewerData.errors ?? 'no viewer')}`,
        )
        res.redirect(errorRedirect)
        return
      }

      const viewer = viewerData.data.viewer
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null

      await this.commandBus.execute(
        new ConnectLinearCommand(
          projectId,
          userId,
          encryptToken(tokenData.access_token),
          tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
          expiresAt,
          viewer.id,
          viewer.name,
          null,
        ),
      )

      this.logger.log(`linear callback: connected projectId=${projectId} viewer=${viewer.name}`)
      res.redirect(`${base}?linear=connected`)
    } catch (error) {
      this.logger.error(
        `linear callback: unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      )
      res.redirect(errorRedirect)
    }
  }
}
