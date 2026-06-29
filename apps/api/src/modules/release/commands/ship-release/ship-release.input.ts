import { Field, ID, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class ShipReleaseInput {
  @Field(() => ID)
  @IsString()
  releaseId: string
}
