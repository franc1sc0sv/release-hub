import { Controller, Get, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { AppException, ErrorCode } from '../../../common/errors'

@Controller('setup/github')
export class GithubAppSetupController {
  @Get('callback')
  callback(
    @Query('installation_id') installationId: string | undefined,
    @Query('setup_action') setupAction: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ): void {
    const webAppUrl = process.env.WEB_APP_URL
    if (!webAppUrl) {
      throw new AppException('WEB_APP_URL is not configured.', ErrorCode.INTEGRATION_ERROR)
    }

    const params = new URLSearchParams()
    if (installationId) params.set('installation_id', installationId)
    if (setupAction) params.set('setup_action', setupAction)
    if (state) params.set('state', state)

    const query = params.toString()
    res.redirect(`${webAppUrl}/github/setup${query ? `?${query}` : ''}`)
  }
}
