import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseFlagDecisionRepository } from '../../../flag-tracking/interfaces/release-flag-decision.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { InProgressFlagReminderType } from '../../types/in-progress-flag-reminder.type'
import { GetInProgressFlagRemindersQuery } from './get-in-progress-flag-reminders.query'

@QueryHandler(GetInProgressFlagRemindersQuery)
export class GetInProgressFlagRemindersHandler extends BaseQueryHandler<
  GetInProgressFlagRemindersQuery,
  InProgressFlagReminderType[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetInProgressFlagRemindersQuery,
    tx: TxClient,
  ): Promise<InProgressFlagReminderType[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const decisions = await this.releaseFlagDecisionRepository.findLatestInProgressForProject(
      query.projectId,
      query.excludeReleaseId,
      tx,
    )

    const results: InProgressFlagReminderType[] = []
    for (const decision of decisions) {
      const release = await this.releaseRepository.findById(decision.releaseId, tx)
      if (!release) continue

      const reminder = new InProgressFlagReminderType()
      reminder.trackedFlagId = decision.trackedFlagId
      reminder.key = decision.key
      reminder.featureId = decision.featureId
      reminder.releaseId = decision.releaseId
      reminder.releaseVersion = release.name ?? release.compareRef
      reminder.decidedAt = decision.decidedAt
      results.push(reminder)
    }

    return results
  }
}
