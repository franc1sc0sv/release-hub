import { Field, ID, InputType } from '@nestjs/graphql'
import { IsArray, IsNotEmpty, IsOptional, IsString, ArrayMaxSize, MaxLength } from 'class-validator'

@InputType()
export class PrAssignmentInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  pullRequestId: string

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  featureId?: string
}

@InputType()
export class UpdateReleaseInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  releaseId: string

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[]

  @Field(() => [PrAssignmentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  prAssignments?: PrAssignmentInput[]
}
