import { Field, Float, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class AiSuggestionType {
  @Field(() => ID)
  featureId!: string

  @Field(() => Float)
  confidence!: number

  @Field(() => String)
  rationale!: string
}
