import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'
import { Logger } from '@nestjs/common'
config({ path: resolve(__dirname, '../../../.env') })

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
  app.use(json({ limit: '10mb' }))
  app.use(urlencoded({ limit: '10mb', extended: true }))
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
  await app.listen(process.env.PORT ?? 3001)
}

bootstrap().catch((err: unknown) => {
  new Logger('Bootstrap').fatal(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
