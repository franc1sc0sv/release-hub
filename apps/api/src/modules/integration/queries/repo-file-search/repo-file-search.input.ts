import { Field, ID, InputType, Int } from '@nestjs/graphql'
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator'

@InputType()
export class RepoFileSearchInput {
  @Field(() => ID)
  @IsString()
  projectId!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  branch?: string

  @Field(() => String)
  @IsString()
  query!: string

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number
}
