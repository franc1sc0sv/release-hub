import { plainToInstance } from 'class-transformer'
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength, validateSync } from 'class-validator'

const NODE_ENVS = ['development', 'production', 'test'] as const

class EnvironmentVariables {
  @IsOptional()
  @IsIn(NODE_ENVS)
  NODE_ENV?: (typeof NODE_ENVS)[number]

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string

  @IsString()
  @MinLength(16)
  JWT_SECRET!: string

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string

  @IsString()
  @IsNotEmpty()
  WEB_APP_URL!: string

  @IsString()
  @IsNotEmpty()
  MAIL_FROM!: string

  @IsString()
  @IsNotEmpty()
  SMTP_HOST!: string
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const parsed = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(parsed, { skipMissingProperties: false })
  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ')
    throw new Error(`Invalid environment configuration: ${details}`)
  }
  return config
}
