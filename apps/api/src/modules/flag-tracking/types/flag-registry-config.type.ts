import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class FlagRegistryConfigType {
  @Field(() => ID)
  projectId: string

  @Field(() => String, { nullable: true })
  flagRegistryPath: string | null

  @Field(() => String, { nullable: true })
  flagRegistryBranch: string | null
}
