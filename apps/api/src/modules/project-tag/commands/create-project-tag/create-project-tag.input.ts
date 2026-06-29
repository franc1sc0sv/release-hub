import { Field, ID, InputType } from '@nestjs/graphql'
import { IsString, MaxLength, IsOptional } from 'class-validator'

@InputType()
export class CreateProjectTagInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => String)
  @IsString()
  @MaxLength(50)
  name: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string
}
