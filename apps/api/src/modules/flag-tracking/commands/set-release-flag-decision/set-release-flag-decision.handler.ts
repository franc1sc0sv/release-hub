import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { FlagHistoryEventType, FlagHistorySource, ReleaseFlagDecisionType } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IFlagHistoryRepository } from '../../interfaces/flag-history.repository'
import type { ICreateFlagHistoryEventData } from '../../interfaces/flag-history.repository'
import { IFlagsmithFlagRepository } from '../../../integration/interfaces/flagsmith-flag.repository'
import { FlagConflictDetectedEvent } from '../../../integration/events/flag-conflict-detected.event'
import { ReleaseFlagDecisionResultType } from '../../types/release-flag-decision.type'
import { SetReleaseFlagDecisionCommand } from './set-release-flag-decision.command'

export type IFlagHistoryEventType = (typeof FlagHistoryEventType)[keyof typeof FlagHistoryEventType]

export const DECISION_HISTORY_EVENT_TYPE: Record<ReleaseFlagDecisionType, IFlagHistoryEventType> = {
  [ReleaseFlagDecisionType.ENABLE_IN_RELEASE]: FlagHistoryEventType.decision_enable_in_release,
  [ReleaseFlagDecisionType.SHIP_OFF]: FlagHistoryEventType.decision_ship_off,
  [ReleaseFlagDecisionType.in_progress]: FlagHistoryEventType.decision_in_progress,
}

@CommandHandler(SetReleaseFlagDecisionCommand)
export class SetReleaseFlagDecisionHandler extends BaseCommandHandler<
  SetReleaseFlagDecisionCommand,
  ReleaseFlagDecisionResultType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SetReleaseFlagDecisionCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<ReleaseFlagDecisionResultType> {
    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: command.userId, projectId: release.projectId, action: Action.UPDATE, subjectKind: Subject.RELEASE },
      tx,
    )

    const trackedFlag = await this.trackedFlagRepository.findById(command.trackedFlagId, tx)
    if (!trackedFlag) throw new NotFoundException('TrackedFlag')

    const decision = await this.releaseFlagDecisionRepository.upsertByReleaseAndFlag(
      {
        releaseId: command.releaseId,
        trackedFlagId: command.trackedFlagId,
        decision: command.decision,
        decidedById: command.userId,
        decidedAt: new Date(),
      },
      tx,
    )

    const historyRows: ICreateFlagHistoryEventData[] = [
      {
        projectId: release.projectId,
        flagKey: trackedFlag.key,
        trackedFlagId: trackedFlag.id,
        releaseId: release.id,
        actorId: command.userId,
        type: DECISION_HISTORY_EVENT_TYPE[command.decision],
        source: FlagHistorySource.user,
      },
    ]

    if (command.decision === ReleaseFlagDecisionType.ENABLE_IN_RELEASE) {
      const project = await this.projectRepository.findById(release.projectId, tx)
      const watchedEnvironments = project?.conflictEnvironments ?? []
      const flagsmithDetail = await this.flagsmithFlagRepository.findFlagDetailByKey(
        release.projectId,
        trackedFlag.key,
        tx,
      )
      const relevantEnvironments =
        watchedEnvironments.length > 0
          ? (flagsmithDetail?.environments.filter((env) => watchedEnvironments.includes(env.name)) ?? [])
          : (flagsmithDetail?.environments ?? [])
      const disabledEnvironment = relevantEnvironments.find((env) => !env.enabled)

      if (disabledEnvironment) {
        historyRows.push({
          projectId: release.projectId,
          flagKey: trackedFlag.key,
          trackedFlagId: trackedFlag.id,
          releaseId: release.id,
          actorId: command.userId,
          type: FlagHistoryEventType.conflict_detected,
          environmentName: disabledEnvironment.name,
          source: FlagHistorySource.user,
        })

        events.push(
          new FlagConflictDetectedEvent(
            release.projectId,
            trackedFlag.key,
            disabledEnvironment.name,
            release.id,
            release.name ?? release.compareRef,
          ),
        )
      }
    }

    await this.flagHistoryRepository.createMany(historyRows, tx)

    const result = new ReleaseFlagDecisionResultType()
    result.id = decision.id
    result.releaseId = decision.releaseId
    result.trackedFlagId = decision.trackedFlagId
    result.decision = decision.decision
    result.decidedById = decision.decidedById
    result.decidedAt = decision.decidedAt
    return result
  }
}
