import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class FlagsmithVerifyResult {
  @Field(() => Boolean)
  ok: boolean

  @Field(() => String, { nullable: true })
  projectName: string | null

  @Field(() => [String])
  environments: string[]

  @Field(() => Boolean)
  hasStaging: boolean

  @Field(() => Boolean)
  hasProduction: boolean

  @Field(() => [String])
  warnings: string[]

  @Field(() => String, { nullable: true })
  message: string | null
}
