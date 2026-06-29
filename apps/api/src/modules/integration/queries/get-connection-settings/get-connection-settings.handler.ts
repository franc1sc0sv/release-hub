import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ConnectionSettingsType } from '../../types/connection-settings.type'
import { GetConnectionSettingsQuery } from './get-connection-settings.query'

@QueryHandler(GetConnectionSettingsQuery)
export class GetConnectionSettingsHandler extends BaseQueryHandler<
  GetConnectionSettingsQuery,
  ConnectionSettingsType
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetConnectionSettingsQuery,
    tx: TxClient,
  ): Promise<ConnectionSettingsType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    const projectSubject = {
      kind: Subject.PROJECT,
      __type: Subject.PROJECT,
      projectId: query.projectId,
    }
    if (!ability.can(Action.READ, projectSubject)) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const credentials = await this.projectRepository.findCredentials(query.projectId, tx)

    const settings = new ConnectionSettingsType()
    settings.githubConnected = project.githubInstallationId !== null
    settings.linearConnected = project.linearEnabled
    settings.flagsmithConnected = project.flagsmithEnabled
    settings.flagsmithUrl = credentials?.flagsmithUrl ?? null
    settings.flagsmithProjectId = credentials?.flagsmithProjectId ?? null
    return settings
  }
}
