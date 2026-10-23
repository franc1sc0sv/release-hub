import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ReleaseBranchStatusType } from '../../types/release-branch-status.type'
import { resolveReleaseParent } from '../../utils/resolve-release-parent'
import { GetReleaseBranchStatusQuery } from './get-release-branch-status.query'

@QueryHandler(GetReleaseBranchStatusQuery)
export class GetReleaseBranchStatusHandler extends BaseQueryHandler<
  GetReleaseBranchStatusQuery,
  ReleaseBranchStatusType
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
  ) {
    super(db)
  }

  protected async handle(
    query: GetReleaseBranchStatusQuery,
    tx: TxClient,
  ): Promise<ReleaseBranchStatusType> {
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

    const project = await this.projectRepository.findById(release.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const accessToken = await this.tokenResolver.resolveForProject(release.projectId, query.userId, tx)
    const parent = await resolveReleaseParent(this.gitHubClient, {
      repo: project.repo,
      accessToken,
      baseRef: release.baseRef,
      compareRef: release.compareRef,
      storedSourceRef: release.sourceRef,
      defaultParentBranch: project.defaultParentBranch,
    })

    const status = new ReleaseBranchStatusType()
    status.sourceRef = parent.sourceRef
    status.detected = parent.detected
    status.behindBy = parent.behindBy
    status.ownCommits = parent.ownCommits
    status.canFastForward = parent.ownCommits === 0
    status.updateMethod = project.branchUpdateMethod
    return status
  }
}
