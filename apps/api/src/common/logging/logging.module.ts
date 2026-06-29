import { Global, Module } from '@nestjs/common'
import { LoggerModule } from 'nestjs-pino'
import { join } from 'path'
import pino, { stdSerializers, stdTimeFunctions } from 'pino'
import pinoPretty from 'pino-pretty'
import { ILogger } from './logging.abstract'
import { PinoLoggerService } from './pino-logger.service'

const level = process.env.LOG_LEVEL ?? 'info'
const logDir = process.env.LOG_DIR ?? join(process.cwd(), 'logs')
const prettyEnabled = process.env.LOG_PRETTY !== 'false'

const fileStream = pino.destination({
  dest: join(logDir, 'app.jsonl'),
  mkdir: true,
  sync: true,
})

const streams = prettyEnabled
  ? [
      { level, stream: fileStream },
      {
        level,
        stream: pinoPretty({ colorize: true, translateTime: 'SYS:standard' }),
      },
    ]
  : [{ level, stream: fileStream }]

@Global()
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level,
        timestamp: stdTimeFunctions.isoTime,
        formatters: { level: (label: string) => ({ level: label }) },
        serializers: { err: stdSerializers.err },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            'password',
            '*.password',
            'token',
            '*.token',
            'accessToken',
            '*.accessToken',
            'apiKey',
            '*.apiKey',
          ],
          censor: '[Redacted]',
        },
        stream: pino.multistream(streams),
      },
    }),
  ],
  providers: [{ provide: ILogger, useClass: PinoLoggerService }],
  exports: [ILogger],
})
export class LoggingModule {}
