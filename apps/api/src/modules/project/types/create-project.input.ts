import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

@InputType()
export class CreateProjectInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  organizationId: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  repo: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  githubInstallationId?: string
}
