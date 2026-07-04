import type { RepositoryMethod } from '../../../common/cqrs/types'
import type {
  IProjectSlackConnectionSummary,
  IProjectMemberForNotification,
  IProjectForDigest,
  IStaleFlagCandidate,
  IInProgressFlagSummary,
  IEnabledProdFlagSummary,
  IDeployedReleaseSummary,
  IShipOffReminderCandidate,
} from './notification.interfaces'

export abstract class INotificationReadRepository {
  abstract findSlackConnectionForProject: RepositoryMethod<
    [projectId: string],
    IProjectSlackConnectionSummary | null
  >
  abstract findMembersForProject: RepositoryMethod<[projectId: string], IProjectMemberForNotification[]>
  abstract findAllActiveProjects: RepositoryMethod<[], IProjectForDigest[]>
  abstract findStaleInProgressFlags: RepositoryMethod<
    [projectId: string, staleDays: number],
    IStaleFlagCandidate[]
  >
  abstract stampFlagRemindedAt: RepositoryMethod<[trackedFlagId: string, remindedAt: Date], void>
  abstract findInProgressFlagsForProject: RepositoryMethod<[projectId: string], IInProgressFlagSummary[]>
  abstract findEnabledProdFlagsForProject: RepositoryMethod<[projectId: string], IEnabledProdFlagSummary[]>
  abstract findReleasesDeployedInWindow: RepositoryMethod<
    [projectId: string, since: Date],
    IDeployedReleaseSummary[]
  >
  abstract findShipOffReminderCandidates: RepositoryMethod<
    [projectId: string, reminderIntervalDays: number],
    IShipOffReminderCandidate[]
  >
}
