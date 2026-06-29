import { ObjectType, Field, Int } from '@nestjs/graphql'

@ObjectType()
export class RefCommitType {
  @Field(() => String)
  sha!: string

  @Field(() => String)
  message!: string

  @Field(() => String)
  author!: string

  @Field(() => String)
  committedAt!: string
}

@ObjectType()
export class RefComparisonType {
  @Field(() => Int)
  aheadBy!: number

  @Field(() => Int)
  behindBy!: number

  @Field(() => Int)
  totalCommits!: number

  @Field(() => [RefCommitType])
  commits!: RefCommitType[]
}
