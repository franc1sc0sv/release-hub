import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagsmithClient } from '../../interfaces/flagsmith-client.abstract'
import { FlagsmithVerifyResult } from '../../types/flagsmith-verify-result.type'
import { VerifyFlagsmithConnectionQuery } from './verify-flagsmith-connection.query'

@QueryHandler(VerifyFlagsmithConnectionQuery)
export class VerifyFlagsmithConnectionHandler extends BaseQueryHandler<
  VerifyFlagsmithConnectionQuery,
  FlagsmithVerifyResult
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithClient: IFlagsmithClient,
  ) {
    super(db)
  }

  protected async handle(
    query: VerifyFlagsmithConnectionQuery,
    tx: TxClient,
  ): Promise<FlagsmithVerifyResult> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const projectsResult = await this.flagsmithClient.listProjects(query.url, query.apiKey)
    if (!projectsResult.ok) {
      return this.failResult(projectsResult.error.message)
    }

    const matchedProject = projectsResult.projects.find((p) => p.id === query.flagsmithProjectId)
    if (!matchedProject) {
      return this.failResult(`No Flagsmith project found with ID "${query.flagsmithProjectId}"`)
    }

    const envsResult = await this.flagsmithClient.listEnvironmentNames(
      query.url,
      query.apiKey,
      query.flagsmithProjectId,
    )
    if (!envsResult.ok) {
      return this.failResult(envsResult.error.message)
    }

    const environments = envsResult.names
    const hasStaging = environments.some((n) => /staging/i.test(n))
    const hasProduction = environments.some((n) => /prod(uction)?/i.test(n))

    const warnings: string[] = []
    if (!hasStaging) {
      warnings.push('No staging environment detected — the flag-parity gate will be inactive.')
    }
    if (!hasProduction) {
      warnings.push('No production environment detected — the flag-parity gate will be inactive.')
    }

    const result = new FlagsmithVerifyResult()
    result.ok = true
    result.projectName = matchedProject.name
    result.environments = environments
    result.hasStaging = hasStaging
    result.hasProduction = hasProduction
    result.warnings = warnings
    result.message = null
    return result
  }

  private failResult(message: string): FlagsmithVerifyResult {
    const result = new FlagsmithVerifyResult()
    result.ok = false
    result.projectName = null
    result.environments = []
    result.hasStaging = false
    result.hasProduction = false
    result.warnings = []
    result.message = message
    return result
  }
}
