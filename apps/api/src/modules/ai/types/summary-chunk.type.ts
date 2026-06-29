import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class SummaryChunkType {
  @Field(() => String)
  chunk!: string

  @Field(() => Boolean)
  done!: boolean
}
