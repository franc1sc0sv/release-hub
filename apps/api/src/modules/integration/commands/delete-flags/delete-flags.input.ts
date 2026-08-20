import { Field, ID, InputType } from '@nestjs/graphql'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator'

@InputType()
export class DeleteFlagsInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  flagKeys: string[]
}
