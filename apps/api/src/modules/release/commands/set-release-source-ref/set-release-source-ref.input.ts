import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

@InputType()
export class SetReleaseSourceRefInput {
  @Field(() => ID)
  @IsString()
  releaseId: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  sourceRef: string
}
