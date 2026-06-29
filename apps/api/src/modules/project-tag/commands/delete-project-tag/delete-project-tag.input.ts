import { Field, ID, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class DeleteProjectTagInput {
  @Field(() => ID)
  @IsString()
  tagId: string
}
