import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { GithubAuthMode } from '../../../common/types/github-auth-mode.enum'

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

  @Field(() => GithubAuthMode, { nullable: true })
  @IsOptional()
  @IsEnum(GithubAuthMode)
  githubAuthMode?: GithubAuthMode

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  githubInstallationId?: string
}
