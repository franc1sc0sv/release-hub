import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { ILogger, LogFields } from './logging.abstract'

@Injectable()
export class PinoLoggerService extends ILogger {
  constructor(private readonly logger: PinoLogger) {
    super()
  }

  debug(fields: LogFields, message: string): void {
    this.logger.debug(fields, message)
  }

  info(fields: LogFields, message: string): void {
    this.logger.info(fields, message)
  }

  warn(fields: LogFields, message: string): void {
    this.logger.warn(fields, message)
  }

  error(fields: LogFields, message: string): void {
    this.logger.error(fields, message)
  }
}
