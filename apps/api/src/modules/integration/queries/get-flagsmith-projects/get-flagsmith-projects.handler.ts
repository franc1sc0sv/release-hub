import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException, IntegrationException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagsmithClient } from '../../interfaces/flagsmith-client.abstract'
import { FlagsmithProjectType } from '../../types/flagsmith-project.type'
import { GetFlagsmithProjectsQuery } from './get-flagsmith-projects.query'

@QueryHandler(GetFlagsmithProjectsQuery)
export class GetFlagsmithProjectsHandler extends BaseQueryHandler<
  GetFlagsmithProjectsQuery,
  FlagsmithProjectType[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithClient: IFlagsmithClient,
  ) {
    super(db)
  }

  protected async handle(
    query: GetFlagsmithProjectsQuery,
    tx: TxClient,
  ): Promise<FlagsmithProjectType[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    const projectSubject = {
      kind: Subject.PROJECT,
      __type: Subject.PROJECT,
      projectId: query.projectId,
    }
    if (!ability.can(Action.UPDATE, projectSubject)) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const result = await this.flagsmithClient.listProjects(query.url, query.apiKey)
    if (!result.ok) {
      if (result.error.kind === 'auth') throw new ForbiddenException()
      throw new IntegrationException(result.error.message)
    }

    return result.projects.map((p) => Object.assign(new FlagsmithProjectType(), p))
  }
}
