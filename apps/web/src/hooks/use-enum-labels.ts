import { useTranslation } from 'react-i18next'
import type {
  FeatureState,
  FeatureKind,
  ReleaseStatus,
  TicketSource,
  ProjectRole,
  InvitationStatus,
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
  }
}
