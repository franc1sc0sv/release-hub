import { Field, InputType } from '@nestjs/graphql'
import { IsEnum, IsString, MaxLength } from 'class-validator'
import { SummaryExampleKind } from '../../../common/types/summary-example-kind.enum'

@InputType()
export class SummaryProfileExampleInput {
  @Field(() => SummaryExampleKind)
  @IsEnum(SummaryExampleKind)
  kind: SummaryExampleKind

  @Field(() => String)
  @IsString()
  @MaxLength(4000)
  content: string

  @Field(() => String)
  @IsString()
  @MaxLength(500)
  explanation: string
}
