import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ILinearConnectionRepository } from '../../../linear-auth/interfaces/linear-connection.repository'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { ITicketSource } from '../../interfaces/ticket-source.abstract'
import { ITicketLinkRepository } from '../../interfaces/ticket-link.repository'
import { resolveConfidence } from '../../clients/ticket-confidence'
import { EnrichPrTicketsQuery } from './enrich-pr-tickets.query'
import type { ITicketEnrichmentResult } from '../../interfaces/ticket-details.interfaces'

@QueryHandler(EnrichPrTicketsQuery)
export class EnrichPrTicketsHandler extends BaseQueryHandler<
  EnrichPrTicketsQuery,
  ITicketEnrichmentResult[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly ticketSource: ITicketSource,
    private readonly ticketLinkRepository: ITicketLinkRepository,
    private readonly linearConnectionRepository: ILinearConnectionRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: EnrichPrTicketsQuery,
    tx: TxClient,
  ): Promise<ITicketEnrichmentResult[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    const pullRequestSubject = {
      kind: Subject.PULL_REQUEST,
      __type: Subject.PULL_REQUEST,
      projectId: query.projectId,
    }
    if (!ability.can(Action.READ, pullRequestSubject)) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const credential = await this.resolveLinearCredential(project.linearEnabled, query.projectId, tx)
    if (!credential) return []

    const results: ITicketEnrichmentResult[] = []

    for (const pr of query.pullRequests) {
      const detectedRefs = this.ticketSource.detectRefs({
        branchName: pr.branchName,
        title: pr.title,
        body: pr.body,
        commitMessages: pr.commitMessages ?? [],
      })

      for (const detected of detectedRefs) {
        const details = await this.ticketSource.confirmIssue(detected.issueId, credential)
        if (!details) continue

        const confidence = resolveConfidence(detected.confidenceSource)
        const enrichment: ITicketEnrichmentResult = {
          pullRequestId: pr.id,
          issueId: details.issueId,
          url: details.url,
          title: details.title,
          description: details.description,
          source: this.ticketSource.source,
          confidence,
        }

        await this.ticketLinkRepository.upsertForPr(enrichment, tx)
        results.push(enrichment)
      }
    }

    return results
  }

  private async resolveLinearCredential(
    linearEnabled: boolean,
    projectId: string,
    tx: TxClient,
  ): Promise<string | null> {
    if (!linearEnabled) return null
    const connection = await this.linearConnectionRepository.findByProject(projectId, tx)
    if (!connection) return null
    return decryptToken(connection.accessToken)
  }
}
