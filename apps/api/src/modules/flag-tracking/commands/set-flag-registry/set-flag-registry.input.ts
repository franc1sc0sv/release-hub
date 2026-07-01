import { Field, ID, InputType } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'

@InputType()
export class SetFlagRegistryInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => String)
  @IsString()
  path: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  branch?: string
}
