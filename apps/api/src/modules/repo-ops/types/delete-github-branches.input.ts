import { Field, ID, InputType } from '@nestjs/graphql'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString, MaxLength } from 'class-validator'

@InputType()
export class DeleteGithubBranchesInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  branchNames: string[]

  @Field(() => [String], { nullable: true, defaultValue: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  overriddenBranchNames?: string[]
}
