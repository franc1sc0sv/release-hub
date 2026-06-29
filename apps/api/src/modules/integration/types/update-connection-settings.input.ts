import { Field, ID, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, MaxLength } from 'class-validator'

@InputType()
export class UpdateConnectionSettingsInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  flagsmithApiKey: string | null

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  flagsmithUrl: string | null

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  flagsmithProjectId: string | null
}
