import { Field, ID, InputType, Int } from '@nestjs/graphql'
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

import { BranchUpdateMethod } from '../../../common/types/branch-update-method.enum'

@InputType()
export class UpdateProjectInput {
  @Field(() => ID)
  @IsString()
  id: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  repo?: string

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  flagReminderIntervalDays?: number

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conflictEnvironments?: string[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultParentBranch?: string | null

  @Field(() => BranchUpdateMethod, { nullable: true })
  @IsOptional()
  @IsEnum(BranchUpdateMethod)
  branchUpdateMethod?: BranchUpdateMethod
}
