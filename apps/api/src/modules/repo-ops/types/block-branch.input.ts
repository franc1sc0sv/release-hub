import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

@InputType()
export class BlockBranchInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  branchName: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string
}
