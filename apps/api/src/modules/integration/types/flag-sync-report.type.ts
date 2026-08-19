import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class FlagSyncDriftType {
  @Field(() => String)
  flagKey!: string

  @Field(() => String)
  environmentName!: string

  @Field(() => String, { nullable: true })
  previousValue!: string | null

  @Field(() => String, { nullable: true })
  newValue!: string | null
}

@ObjectType()
export class FlagSyncReportType {
  @Field(() => Int)
  flagCount!: number

  @Field(() => [String])
  addedKeys!: string[]

  @Field(() => [String])
  removedKeys!: string[]

  @Field(() => [String])
  environmentsAdded!: string[]

  @Field(() => [FlagSyncDriftType])
  enabledChanges!: FlagSyncDriftType[]

  @Field(() => [FlagSyncDriftType])
  valueChanges!: FlagSyncDriftType[]

  @Field(() => Boolean)
  inSync!: boolean

  @Field(() => GraphQLISODateTime)
  syncedAt!: Date
}
