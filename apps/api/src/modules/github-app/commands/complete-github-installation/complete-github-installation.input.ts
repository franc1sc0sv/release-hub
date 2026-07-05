import { Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class CompleteGithubInstallationInput {
  @Field(() => String)
  @IsString()
  installationId: string

  @Field(() => String)
  @IsString()
  state: string
}
