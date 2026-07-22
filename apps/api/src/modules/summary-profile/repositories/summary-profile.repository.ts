import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ISummaryProfileRepository } from '../interfaces/summary-profile.repository'
import type {
  ISummaryProfile,
  ISummaryProfileRule,
  ISummaryProfileExample,
  ICreateSummaryProfileData,
  IUpdateSummaryProfileData,
} from '../interfaces/summary-profile.interfaces'
import type { SummaryExampleKind } from '../../../common/types/summary-example-kind.enum'

const includeChildren = {
  rules: { orderBy: { position: 'asc' as const } },
  examples: { orderBy: { position: 'asc' as const } },
}

@Injectable()
export class SummaryProfileRepository extends ISummaryProfileRepository {
  findById = async (id: string, tx: TxClient): Promise<ISummaryProfile | null> => {
    const row = await tx.summaryProfile.findFirst({
      where: { id, deletedAt: null },
      include: includeChildren,
    })
    if (!row) return null
    return this.toISummaryProfile(row)
  }

  listByProject = async (projectId: string, tx: TxClient): Promise<ISummaryProfile[]> => {
    const rows = await tx.summaryProfile.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: includeChildren,
    })
    return rows.map((row) => this.toISummaryProfile(row))
  }

  create = async (data: ICreateSummaryProfileData, tx: TxClient): Promise<ISummaryProfile> => {
    const row = await tx.summaryProfile.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        outputTemplate: data.outputTemplate,
        rules: {
          create: data.rules.map((rule, position) => ({ content: rule.content, position })),
        },
        examples: {
          create: data.examples.map((example, position) => ({
            kind: example.kind,
            content: example.content,
            explanation: example.explanation,
            position,
          })),
        },
      },
      include: includeChildren,
    })
    return this.toISummaryProfile(row)
  }

  update = async (id: string, data: IUpdateSummaryProfileData, tx: TxClient): Promise<ISummaryProfile> => {
    const row = await tx.summaryProfile.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        outputTemplate: data.outputTemplate,
        rules: {
          deleteMany: {},
          create: data.rules.map((rule, position) => ({ content: rule.content, position })),
        },
        examples: {
          deleteMany: {},
          create: data.examples.map((example, position) => ({
            kind: example.kind,
            content: example.content,
            explanation: example.explanation,
            position,
          })),
        },
      },
      include: includeChildren,
    })
    return this.toISummaryProfile(row)
  }

  softDelete = async (id: string, tx: TxClient): Promise<void> => {
    await tx.summaryProfile.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  private toISummaryProfileRule(row: { id: string; content: string; position: number }): ISummaryProfileRule {
    return {
      id: row.id,
      content: row.content,
      position: row.position,
    }
  }

  private toISummaryProfileExample(row: {
    id: string
    kind: string
    content: string
    explanation: string
    position: number
  }): ISummaryProfileExample {
    return {
      id: row.id,
      kind: row.kind as SummaryExampleKind,
      content: row.content,
      explanation: row.explanation,
      position: row.position,
    }
  }

  private toISummaryProfile(row: {
    id: string
    projectId: string
    name: string
    description: string | null
    outputTemplate: string | null
    createdAt: Date
    updatedAt: Date
    rules: Array<{ id: string; content: string; position: number }>
    examples: Array<{ id: string; kind: string; content: string; explanation: string; position: number }>
  }): ISummaryProfile {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      outputTemplate: row.outputTemplate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      rules: row.rules.map((rule) => this.toISummaryProfileRule(rule)),
      examples: row.examples.map((example) => this.toISummaryProfileExample(example)),
    }
  }
}
