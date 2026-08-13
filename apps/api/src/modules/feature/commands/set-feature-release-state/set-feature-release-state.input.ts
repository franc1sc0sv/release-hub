import { Field, ID, InputType } from '@nestjs/graphql'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { FeatureState } from '../../../../common/types/feature-state.enum'

@InputType()
export class SetFeatureReleaseStateInput {
  @Field(() => ID)
  @IsString()
  featureId: string

  @Field(() => ID)
  @IsString()
  releaseId: string

  @Field(() => FeatureState)
  @IsEnum(FeatureState)
  state: FeatureState

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  flagKey?: string
}
