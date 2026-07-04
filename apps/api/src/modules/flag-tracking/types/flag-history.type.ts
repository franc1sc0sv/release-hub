import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { GraphQLISODateTime } from '@nestjs/graphql'
import { FlagHistoryEventType } from '../../../common/types/flag-history-event-type.enum'
import { FlagHistorySource } from '../../../common/types/flag-history-source.enum'

@InputType()
export class GetFlagHistoryInput {
  @Field(() => ID)
  @IsString()
  projectId!: string

  @Field(() => String)
  @IsString()
  flagKey!: string

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number
}

@ObjectType()
export class FlagHistoryEventEntryType {
  @Field(() => ID)
  id!: string

  @Field(() => FlagHistoryEventType)
  type!: FlagHistoryEventType

  @Field(() => String, { nullable: true })
  environmentName!: string | null

  @Field(() => String, { nullable: true })
  previousValue!: string | null

  @Field(() => String, { nullable: true })
  newValue!: string | null

  @Field(() => ID, { nullable: true })
  releaseId!: string | null

  @Field(() => String, { nullable: true })
  releaseName!: string | null

  @Field(() => String, { nullable: true })
  actorName!: string | null

  @Field(() => FlagHistorySource)
  source!: FlagHistorySource

  @Field(() => GraphQLISODateTime)
  occurredAt!: Date
}

@ObjectType()
export class FlagHistoryPageType {
  @Field(() => [FlagHistoryEventEntryType])
  items!: FlagHistoryEventEntryType[]

  @Field(() => Int)
  totalCount!: number
}
