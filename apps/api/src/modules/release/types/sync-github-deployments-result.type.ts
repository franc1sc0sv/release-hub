import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class SyncGithubDeploymentsResultType {
  @Field(() => Boolean)
  matched: boolean

  @Field(() => ID, { nullable: true })
  githubDeploymentId: string | null

  @Field(() => String, { nullable: true })
  environment: string | null
}
