import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { GetReleaseQuery } from './get-release.query'

@QueryHandler(GetReleaseQuery)
export class GetReleaseHandler extends BaseQueryHandler<GetReleaseQuery, ReleaseObjectType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetReleaseQuery, tx: TxClient): Promise<ReleaseObjectType> {
    const release = await this.releaseRepository.findById(query.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: query.userId,
        projectId: release.projectId,
        action: Action.READ,
        subjectKind: Subject.RELEASE,
      },
      tx,
    )

    return toReleaseObjectType(release)
  }
}
