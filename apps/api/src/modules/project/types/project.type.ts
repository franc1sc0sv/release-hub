import { Field, ID, ObjectType } from '@nestjs/graphql'
import { ProjectIntegrationsType } from './project-integrations.type'
import { ConnectionHealthType } from './connection-health.type'

@ObjectType()
export class ProjectType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  name: string

  @Field(() => String)
  repo: string

  @Field(() => ProjectIntegrationsType)
  integrations: ProjectIntegrationsType

  @Field(() => ConnectionHealthType)
  connectionHealth: ConnectionHealthType

  @Field(() => String)
  ownerId: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}
