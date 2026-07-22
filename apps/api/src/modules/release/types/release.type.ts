import { Field, ID, ObjectType } from '@nestjs/graphql'
import { ReleaseStatus } from '../../../common/types/release-status.enum'
import { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import { AiSummaryStatus } from '../../../common/types/ai-summary-status.enum'

@ObjectType()
export class ReleaseObjectType {
  @Field(() => ID)
  id: string

  @Field(() => ID)
  projectId: string

  @Field(() => String, { nullable: true })
  name: string | null

  @Field(() => String)
  baseRef: string

  @Field(() => String)
  compareRef: string

  @Field(() => ReleaseStatus)
  status: ReleaseStatus

  @Field(() => AiDraftStatus)
  aiDraftStatus: AiDraftStatus

  @Field(() => String, { nullable: true })
  prUrl: string | null

  @Field(() => [String])
  tags: string[]

  @Field(() => String, { nullable: true })
  summary: string | null

  @Field(() => Date, { nullable: true })
  summaryEditedAt: Date | null

  @Field(() => Date, { nullable: true })
  deployedAt: Date | null

  @Field(() => String, { nullable: true })
  githubDeploymentId: string | null

  @Field(() => ID, { nullable: true })
  summaryProfileId: string | null

  @Field(() => String, { nullable: true })
  summaryModel: string | null

  @Field(() => AiSummaryStatus)
  summaryStatus: AiSummaryStatus

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}
