import { Field, ObjectType } from '@nestjs/graphql'
import { GraphQLISODateTime } from '@nestjs/graphql'
import { FlagDeploymentStatus } from '../../../common/types/flag-deployment-status.enum'

@ObjectType()
export class FlagEnvironmentStateType {
  @Field(() => String)
  name!: string

  @Field(() => Boolean)
  enabled!: boolean

  @Field(() => String, { nullable: true })
  value!: string | null
}

@ObjectType()
export class FlagRefType {
  @Field(() => String)
  key!: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt!: Date | null

  @Field(() => [FlagEnvironmentStateType])
  environments!: FlagEnvironmentStateType[]

  @Field(() => FlagDeploymentStatus)
  deploymentStatus!: FlagDeploymentStatus
}

@ObjectType()
export class FlagsResultType {
  @Field(() => [String])
  environments!: string[]

  @Field(() => Number)
  totalCount!: number

  @Field(() => [FlagRefType])
  items!: FlagRefType[]

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastSyncedAt!: Date | null
}

@ObjectType()
export class FlagComparisonRowType {
  @Field(() => String)
  key!: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt!: Date | null

  @Field(() => Boolean, { nullable: true })
  baselineEnabled!: boolean | null

  @Field(() => Boolean)
  baselineConflict!: boolean

  @Field(() => [FlagEnvironmentStateType])
  baseline!: FlagEnvironmentStateType[]

  @Field(() => [FlagEnvironmentStateType])
  divergences!: FlagEnvironmentStateType[]
}

@ObjectType()
export class FlagComparisonResultType {
  @Field(() => [String])
  baselineEnvironments!: string[]

  @Field(() => [String])
  comparedEnvironments!: string[]

  @Field(() => [FlagComparisonRowType])
  items!: FlagComparisonRowType[]
}
