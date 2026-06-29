import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class CoverageType {
  @Field(() => Int)
  total: number

  @Field(() => Int)
  assigned: number

  @Field(() => Boolean)
  ready: boolean
}
