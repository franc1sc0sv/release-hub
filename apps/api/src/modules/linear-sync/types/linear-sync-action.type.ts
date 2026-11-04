import { Field, ID, ObjectType } from '@nestjs/graphql'
import { LinearSyncActionKind } from '../../../common/types/linear-sync-action-kind.enum'
import { LinearSyncActionStatus } from '../../../common/types/linear-sync-action-status.enum'
import type { ILinearSyncAction } from '../interfaces/linear-sync.interfaces'

@ObjectType()
export class LinearSyncActionType {
  @Field(() => ID)
  id: string

  @Field(() => String)
  issueIdentifier: string

  @Field(() => LinearSyncActionKind)
  kind: LinearSyncActionKind

  @Field(() => LinearSyncActionStatus)
  status: LinearSyncActionStatus

  @Field(() => String)
  detail: string

  @Field(() => Date)
  updatedAt: Date
}

export function toLinearSyncActionType(action: ILinearSyncAction): LinearSyncActionType {
  return {
    id: action.id,
    issueIdentifier: action.issueIdentifier,
    kind: action.kind,
    status: action.status,
    detail: action.detail,
    updatedAt: action.updatedAt,
  }
}
