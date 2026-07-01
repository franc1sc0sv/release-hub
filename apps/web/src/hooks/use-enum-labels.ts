import { useTranslation } from 'react-i18next'
import type {
  FeatureState,
  FeatureKind,
  ReleaseStatus,
  TicketSource,
  ProjectRole,
  InvitationStatus,
  FlagChangeAction,
  FlagReferenceKind,
  ReleaseFlagDecisionType,
} from '@/generated/graphql'

export function useEnumLabels() {
  const { t } = useTranslation('enums')

  return {
    featureState: (v: FeatureState): string => t(`featureState.${v}`),
    featureKind: (v: FeatureKind): string => t(`featureKind.${v}`),
    releaseStatus: (v: ReleaseStatus): string => t(`releaseStatus.${v}`),
    ticketSource: (v: TicketSource): string => t(`ticketSource.${v}`),
    projectRole: (v: ProjectRole): string => t(`projectRole.${v}`),
    invitationStatus: (v: InvitationStatus): string => t(`invitationStatus.${v}`),
    flagAction: (v: FlagChangeAction): string => t(`flagAction.${v}`),
    flagReferenceKind: (v: FlagReferenceKind): string => t(`flagReferenceKind.${v}`),
    releaseFlagDecision: (v: ReleaseFlagDecisionType): string => t(`releaseFlagDecision.${v}`),
  }
}
