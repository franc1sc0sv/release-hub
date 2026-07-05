import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { IDatabaseService } from '../../common/database/database.abstract'

@Controller()
export class HealthController {
  constructor(private readonly database: IDatabaseService) {}

  @Get('healthz')
  liveness(): { status: string } {
    return { status: 'ok' }
  }

  @Get('readyz')
  async readiness(): Promise<{ status: string }> {
    try {
      await this.database.$query((tx) => tx.$queryRawUnsafe('SELECT 1'))
    } catch {
      throw new ServiceUnavailableException({ status: 'unavailable' })
    }
    return { status: 'ok' }
  }
}
