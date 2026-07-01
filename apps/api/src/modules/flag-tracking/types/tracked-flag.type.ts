import { Field, ID, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class TrackedFlagFeatureType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  name: string
}

@ObjectType()
export class FlagBranchPresenceType {
  @Field(() => String)
  branch: string

  @Field(() => Boolean)
  present: boolean

  @Field(() => Date)
  lastConfirmedAt: Date
}

@ObjectType()
export class TrackedFlagType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  key: string

  @Field(() => Boolean)
  presentInCode: boolean

  @Field(() => TrackedFlagFeatureType, { nullable: true })
  feature: TrackedFlagFeatureType | null

  @Field(() => Int, { nullable: true })
  addedInPullRequestNumber: number | null

  @Field(() => [FlagBranchPresenceType])
  branchPresences: FlagBranchPresenceType[]

  @Field(() => Int)
  branchesPresentCount: number
}
