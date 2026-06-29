import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ProjectIntegrationsType {
  @Field(() => Boolean)
  github: boolean

  @Field(() => Boolean)
  linear: boolean

  @Field(() => Boolean)
  flagsmith: boolean
}
