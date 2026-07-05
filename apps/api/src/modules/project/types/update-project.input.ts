import { Field, ID, InputType, Int } from '@nestjs/graphql'
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

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
}
