import { plainToInstance } from 'class-transformer'
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  validateSync,
} from 'class-validator'

const NODE_ENVS = ['development', 'production', 'test'] as const

const sendsEmail = (env: EnvironmentVariables): boolean => env.NODE_ENV === 'production'

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

  @ValidateIf(sendsEmail)
  @IsString()
  @IsNotEmpty()
  MAIL_FROM?: string

  @ValidateIf(sendsEmail)
  @IsString()
  @IsNotEmpty()
  SMTP_HOST?: string
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
