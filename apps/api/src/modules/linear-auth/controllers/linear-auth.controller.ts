import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import type { Request, Response } from 'express'
import { encryptToken } from '../../../common/crypto/token-cipher'
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
  ) {}

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const webAppUrl = process.env.WEB_APP_URL ?? 'http://localhost:5173'
    const errorRedirect = `${webAppUrl}/settings?linear=error`

    try {
      const cookieState = req.cookies['linear_oauth_state'] as string | undefined
      if (!cookieState || cookieState !== this.extractNonce(state)) {
        this.logger.warn(
          `linear callback: state cookie check failed (cookiePresent=${cookieState != null})`,
        )
        res.clearCookie('linear_oauth_state', { path: '/' })
        res.redirect(errorRedirect)
        return
      }

      res.clearCookie('linear_oauth_state', { path: '/' })

      const payload = this.jwtService.verify<ILinearStatePayload>(state)
      const userId = payload.sub
      const projectId = payload.projectId

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
      res.redirect(`${webAppUrl}/settings?linear=connected`)
    } catch (error) {
      this.logger.error(
        `linear callback: unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      )
      res.clearCookie('linear_oauth_state', { path: '/' })
      res.redirect(errorRedirect)
    }
  }

  private extractNonce(signedState: string): string | undefined {
    try {
      const payload = this.jwtService.verify<ILinearStatePayload>(signedState)
      return payload.nonce
    } catch {
      return undefined
    }
  }
}
