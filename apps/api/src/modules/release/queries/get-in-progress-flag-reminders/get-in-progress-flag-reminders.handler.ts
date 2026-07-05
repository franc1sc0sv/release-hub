import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
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
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetInProgressFlagRemindersQuery,
    tx: TxClient,
  ): Promise<InProgressFlagReminderType[]> {
    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: query.userId,
        projectId: query.projectId,
        action: Action.READ,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

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
