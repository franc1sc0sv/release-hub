import { Field, ID, InputType, registerEnumType } from '@nestjs/graphql'
import { IsEnum, IsString } from 'class-validator'

export const ExportFormat = {
  MD: 'md',
  PDF: 'pdf',
} as const

export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat]

registerEnumType(ExportFormat, { name: 'ExportFormat' })

@InputType()
export class ExportSummaryInput {
  @Field(() => ID)
  @IsString()
  releaseId: string

  @Field(() => ExportFormat)
  @IsEnum(ExportFormat)
  format: ExportFormat
}
