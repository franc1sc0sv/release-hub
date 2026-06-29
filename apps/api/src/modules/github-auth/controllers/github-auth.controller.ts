import { Controller, Get, Query, Req, Res } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import type { Request, Response } from 'express'
import { encryptToken } from '../../../common/crypto/token-cipher'
import { ConnectGithubCommand } from '../commands/connect-github/connect-github.command'

interface IGithubStatePayload {
  sub: string
  nonce: string
}

interface IGithubTokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  error?: string
}

interface IGithubUserResponse {
  id: number
  login: string
}

@Controller('auth/github')
export class GithubAuthController {
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
    const errorRedirect = `${webAppUrl}/settings?github=error`

    try {
      const cookieState = req.cookies['gh_oauth_state'] as string | undefined
      if (!cookieState || cookieState !== this.extractNonce(state)) {
        res.clearCookie('gh_oauth_state', { path: '/' })
        res.redirect(errorRedirect)
        return
      }

      res.clearCookie('gh_oauth_state', { path: '/' })

      const payload = this.jwtService.verify<IGithubStatePayload>(state)
      const userId = payload.sub

      const clientId = process.env.GITHUB_APP_CLIENT_ID!
      const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET!
      const callbackUrl =
        process.env.GITHUB_APP_CALLBACK_URL ?? 'http://localhost:3001/auth/github/callback'

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: callbackUrl,
        }),
      })

      const tokenData = (await tokenResponse.json()) as IGithubTokenResponse

      if (!tokenData.access_token || tokenData.error) {
        res.redirect(errorRedirect)
        return
      }

      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github+json',
        },
      })

      const githubUser = (await userResponse.json()) as IGithubUserResponse

      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null

      await this.commandBus.execute(
        new ConnectGithubCommand(
          userId,
          encryptToken(tokenData.access_token),
          tokenData.refresh_token ?? null,
          expiresAt,
          String(githubUser.id),
          githubUser.login,
          null,
        ),
      )

      res.redirect(`${webAppUrl}/settings?github=connected`)
    } catch {
      res.clearCookie('gh_oauth_state', { path: '/' })
      res.redirect(errorRedirect)
    }
  }

  private extractNonce(signedState: string): string | undefined {
    try {
      const payload = this.jwtService.verify<IGithubStatePayload>(signedState)
      return payload.nonce
    } catch {
      return undefined
    }
  }
}
