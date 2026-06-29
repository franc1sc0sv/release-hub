import { Field, ID, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class RejectSuggestedFeatureInput {
  @Field(() => ID)
  @IsString()
  featureId: string
}
