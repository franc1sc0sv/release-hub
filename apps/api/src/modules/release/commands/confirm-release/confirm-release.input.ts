import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

@InputType()
export class ConfirmReleaseInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  releaseId: string
}
