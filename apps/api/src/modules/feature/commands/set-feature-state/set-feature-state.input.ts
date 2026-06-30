import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEnum, IsString } from 'class-validator'
import { FeatureState } from '../../../../common/types/feature-state.enum'

@InputType()
export class SetFeatureStateInput {
  @Field(() => ID)
  @IsString()
  featureId: string

  @Field(() => FeatureState)
  @IsEnum(FeatureState)
  state: FeatureState
}
