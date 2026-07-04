import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql'
import { FlagDeploymentStatus } from '../../../common/types/flag-deployment-status.enum'
import { TrackedFlagDetailType } from './tracked-flag-detail.type'

@ObjectType()
export class FlagDetailFlagsmithEnvironmentType {
  @Field(() => String)
  name!: string

  @Field(() => Boolean)
  enabled!: boolean

  @Field(() => String, { nullable: true })
  value!: string | null

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date
}

@ObjectType()
export class FlagDetailFlagsmithType {
  @Field(() => Boolean)
  exists!: boolean

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastSyncedAt!: Date | null

  @Field(() => [FlagDetailFlagsmithEnvironmentType])
  environments!: FlagDetailFlagsmithEnvironmentType[]
}

@ObjectType()
export class FlagDetailType {
  @Field(() => String)
  key!: string

  @Field(() => FlagDetailFlagsmithType)
  flagsmith!: FlagDetailFlagsmithType

  @Field(() => TrackedFlagDetailType, { nullable: true })
  tracked!: TrackedFlagDetailType | null

  @Field(() => FlagDeploymentStatus)
  deploymentStatus!: FlagDeploymentStatus

  @Field(() => Boolean)
  hasConflict!: boolean
}
