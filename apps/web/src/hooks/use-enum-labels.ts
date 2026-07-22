import { useTranslation } from 'react-i18next'
import type {
  FeatureState,
  FeatureKind,
  ReleaseStatus,
  TicketSource,
  OrgRole,
  InvitationStatus,
  FlagChangeAction,
  FlagReferenceKind,
  FlagActivityFilter,
  FlagDeploymentStatus,
  FlagHistoryEventType,
  FlagHistorySource,
  ReleaseFlagDecisionType,
  NotificationType,
  NotificationChannel,
  DigestFrequency,
  BranchBlockReason,
  SummaryExampleKind,
} from '@/generated/graphql'

export function useEnumLabels() {
  const { t } = useTranslation('enums')

  return {
    featureState: (v: FeatureState): string => t(`featureState.${v}`),
    featureKind: (v: FeatureKind): string => t(`featureKind.${v}`),
    releaseStatus: (v: ReleaseStatus): string => t(`releaseStatus.${v}`),
    ticketSource: (v: TicketSource): string => t(`ticketSource.${v}`),
    orgRole: (v: OrgRole): string => t(`orgRole.${v}`),
    invitationStatus: (v: InvitationStatus): string => t(`invitationStatus.${v}`),
    flagAction: (v: FlagChangeAction): string => t(`flagAction.${v}`),
    flagReferenceKind: (v: FlagReferenceKind): string => t(`flagReferenceKind.${v}`),
    flagActivityFilter: (v: FlagActivityFilter): string => t(`flagActivityFilter.${v}`),
    flagDeploymentStatus: (v: FlagDeploymentStatus): string => t(`flagDeploymentStatus.${v}`),
    flagHistoryEventType: (v: FlagHistoryEventType): string => t(`flagHistoryEventType.${v}`),
    flagHistorySource: (v: FlagHistorySource): string => t(`flagHistorySource.${v}`),
    releaseFlagDecision: (v: ReleaseFlagDecisionType): string => t(`releaseFlagDecision.${v}`),
    notificationType: (v: NotificationType): string => t(`notificationType.${v}`),
    notificationChannel: (v: NotificationChannel): string => t(`notificationChannel.${v}`),
    digestFrequency: (v: DigestFrequency): string => t(`digestFrequency.${v}`),
    branchBlockReason: (v: BranchBlockReason): string => t(`branchBlockReason.${v}`),
    summaryExampleKind: (v: SummaryExampleKind): string => t(`summaryExampleKind.${v}`),
  }
}
