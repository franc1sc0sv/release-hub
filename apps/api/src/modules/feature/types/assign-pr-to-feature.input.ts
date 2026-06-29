import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

@InputType()
export class AssignPrToFeatureInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  prId: string

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  featureId: string
}
