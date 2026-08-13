import { Field, ID, InputType, Int } from '@nestjs/graphql'
import { IsOptional, IsString, IsInt, IsBoolean, Min, Max } from 'class-validator'

@InputType()
export class ListFeaturesPageInput {
  @Field(() => ID)
  @IsString()
  projectId!: string

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  assignableOnly?: boolean
}
