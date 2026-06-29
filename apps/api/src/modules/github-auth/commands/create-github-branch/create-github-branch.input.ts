import { Field, ID, InputType } from '@nestjs/graphql'
import { IsString, MaxLength, Matches } from 'class-validator'

@InputType()
export class CreateGithubBranchInput {
  @Field(() => ID)
  @IsString()
  projectId!: string

  @Field(() => String)
  @IsString()
  @MaxLength(255)
  @Matches(/^\S+$/, { message: 'Branch name must not contain spaces' })
  name!: string

  @Field(() => String)
  @IsString()
  fromRef!: string
}
