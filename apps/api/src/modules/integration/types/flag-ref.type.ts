import { Field, ObjectType } from '@nestjs/graphql'
import { GraphQLISODateTime } from '@nestjs/graphql'

@ObjectType()
export class FlagEnvironmentStateType {
  @Field(() => String)
  name!: string

  @Field(() => Boolean)
  enabled!: boolean
}

@ObjectType()
export class FlagRefType {
  @Field(() => String)
  key!: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt!: Date | null

  @Field(() => [FlagEnvironmentStateType])
  environments!: FlagEnvironmentStateType[]
}

@ObjectType()
export class FlagsResultType {
  @Field(() => [String])
  environments!: string[]

  @Field(() => Number)
  totalCount!: number

  @Field(() => [FlagRefType])
  items!: FlagRefType[]
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
