import 'reflect-metadata'
import { config } from 'dotenv'
import { existsSync } from 'fs'
import { createConnection } from 'net'
import { resolve } from 'path'
import { Logger } from '@nestjs/common'
import type { INestApplication } from '@nestjs/common'
import type { IRawBodyRequest } from './modules/webhooks/interfaces/raw-body-request.interface'

if (process.env.NODE_ENV !== 'production') {
  const localEnvFile = [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')].find(existsSync)
  if (localEnvFile) {
    config({ path: localEnvFile })
  }
}

const PORT_SCAN_LIMIT = 20
const PORT_PROBE_MS = 500

function isPortFree(port: number): Promise<boolean> {
  return new Promise((done) => {
    const probe = createConnection({ port, host: 'localhost' })
    const finish = (free: boolean): void => {
      probe.destroy()
      done(free)
    }
    probe.setTimeout(PORT_PROBE_MS)
    probe.once('connect', () => finish(false))
    probe.once('timeout', () => finish(true))
    probe.once('error', () => finish(true))
  })
}

async function listenOnFreePort(app: INestApplication, preferred: number): Promise<number> {
  for (let port = preferred; port < preferred + PORT_SCAN_LIMIT; port += 1) {
    if (await isPortFree(port)) {
      await app.listen(port)
      return port
    }
  }
  throw new Error(`No free port between ${preferred} and ${preferred + PORT_SCAN_LIMIT - 1}`)
}

function captureRawBodyForWebhooks(req: IRawBodyRequest, _res: unknown, buffer: Buffer): void {
  if (req.originalUrl.startsWith('/webhooks/')) {
    req.rawBody = Buffer.from(buffer)
  }
}

async function bootstrap() {
  const { NestFactory } = await import('@nestjs/core')
  const { ValidationPipe } = await import('@nestjs/common')
  const { AppModule } = await import('./app.module')

  const { json, urlencoded } = await import('express')
  const cookieParser = (await import('cookie-parser')).default
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  })
  const { Logger: NestPinoLogger } = await import('nestjs-pino')
  app.useLogger(app.get(NestPinoLogger))
  app.use(json({ limit: '10mb', verify: captureRawBodyForWebhooks }))
  app.use(urlencoded({ limit: '10mb', extended: true, verify: captureRawBodyForWebhooks }))
  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  })
  const preferredPort = Number(process.env.PORT ?? 3001)
  const port = await listenOnFreePort(app, preferredPort)
  new Logger('Bootstrap').log(
    port === preferredPort
      ? `API listening on http://localhost:${port}`
      : `API listening on http://localhost:${port} (port ${preferredPort} was taken)`,
  )
}

bootstrap().catch((err: unknown) => {
  new Logger('Bootstrap').fatal(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
