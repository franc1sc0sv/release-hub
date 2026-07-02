import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

@InputType()
export class UnblockBranchInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  branchName: string
}
