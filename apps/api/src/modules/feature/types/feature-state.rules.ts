import { AppException } from '../../../common/errors/app.exception'
import { ErrorCode } from '../../../common/errors/error-codes.enum'
import { FeatureKind } from '../../../common/types/feature-kind.enum'
import { FeatureState } from '../../../common/types/feature-state.enum'
import type { IFeature } from '../interfaces/feature.interfaces'

export function assertFeatureStateEditable(feature: IFeature): void {
  if (feature.kind === FeatureKind.DEFAULT) {
    throw new AppException(
      'System features keep a fixed status and cannot be changed',
      ErrorCode.VALIDATION_ERROR,
    )
  }
}

export function assertFeatureAcceptsPullRequests(feature: IFeature): void {
  if (feature.state === FeatureState.COMPLETED) {
    throw new AppException(
      'This feature is completed and cannot take new pull requests',
      ErrorCode.VALIDATION_ERROR,
    )
  }
}
