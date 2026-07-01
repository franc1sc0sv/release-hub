import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { FlagRegistryConfigType } from '../../types/flag-registry-config.type'
import { GetFlagRegistryQuery } from './get-flag-registry.query'

@QueryHandler(GetFlagRegistryQuery)
export class GetFlagRegistryHandler extends BaseQueryHandler<GetFlagRegistryQuery, FlagRegistryConfigType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFlagRegistryQuery, tx: TxClient): Promise<FlagRegistryConfigType> {
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

    const config = await this.projectRepository.findFlagRegistryConfig(query.projectId, tx)

    const type = new FlagRegistryConfigType()
    type.projectId = query.projectId
    type.flagRegistryPath = config?.flagRegistryPath ?? null
    type.flagRegistryBranch = config?.flagRegistryBranch ?? null
    return type
  }
}
