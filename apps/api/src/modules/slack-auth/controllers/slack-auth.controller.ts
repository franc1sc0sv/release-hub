import { Controller, Get, Query, Req, Res } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import type { Request, Response } from 'express'
import { encryptToken } from '../../../common/crypto/token-cipher'
import { ISlackApiClient } from '../interfaces/slack-api-client'
import { ConnectSlackCommand } from '../commands/connect-slack/connect-slack.command'

interface ISlackStatePayload {
  sub: string
  projectId: string
  nonce: string
}

@Controller('auth/slack')
export class SlackAuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly slackApiClient: ISlackApiClient,
  ) {}

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const webAppUrl = process.env.WEB_APP_URL ?? 'http://localhost:5173'
    const errorRedirect = `${webAppUrl}/settings?slack=error`

    try {
      const cookieState = req.cookies['slack_oauth_state'] as string | undefined
      if (!cookieState || cookieState !== this.extractNonce(state)) {
        res.clearCookie('slack_oauth_state', { path: '/' })
        res.redirect(errorRedirect)
        return
      }

      res.clearCookie('slack_oauth_state', { path: '/' })

      const payload = this.jwtService.verify<ISlackStatePayload>(state)
      const userId = payload.sub
      const projectId = payload.projectId

      const callbackUrl =
        process.env.SLACK_CALLBACK_URL ?? 'http://localhost:3001/auth/slack/callback'

      const tokenResult = await this.slackApiClient.exchangeCodeForToken(code, callbackUrl)

      if (!tokenResult.ok || !tokenResult.accessToken || !tokenResult.teamId || !tokenResult.teamName) {
        res.redirect(errorRedirect)
        return
      }

      await this.commandBus.execute(
        new ConnectSlackCommand(
          projectId,
          userId,
          encryptToken(tokenResult.accessToken),
          tokenResult.teamId,
          tokenResult.teamName,
        ),
      )

      res.redirect(`${webAppUrl}/settings?slack=connected`)
    } catch {
      res.clearCookie('slack_oauth_state', { path: '/' })
      res.redirect(errorRedirect)
    }
  }

  private extractNonce(signedState: string): string | undefined {
    try {
      const payload = this.jwtService.verify<ISlackStatePayload>(signedState)
      return payload.nonce
    } catch {
      return undefined
    }
  }
}
