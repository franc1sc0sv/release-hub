import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import PDFDocument from 'pdfkit'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { htmlToMarkdown, stripInlineMarkdown } from '../../../../common/text/html-to-markdown'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ExportResultType } from '../../types/export-result.type'
import { ExportFormat } from '../../types/export-summary.input'
import { ExportSummaryQuery } from './export-summary.query'

@QueryHandler(ExportSummaryQuery)
export class ExportSummaryHandler extends BaseQueryHandler<ExportSummaryQuery, ExportResultType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db)
  }

  protected async handle(query: ExportSummaryQuery, tx: TxClient): Promise<ExportResultType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    const release = await this.releaseRepository.findById(query.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    if (
      !ability.can(Action.READ, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: release.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    if (!release.summary) {
      throw new AppException('No summary exists for this release', ErrorCode.NOT_FOUND)
    }

    const result = new ExportResultType()
    const releaseName = release.name ?? release.compareRef
    const markdown = htmlToMarkdown(release.summary)

    if (query.format === ExportFormat.MD) {
      const encoded = Buffer.from(markdown, 'utf-8').toString('base64')
      result.url = `data:text/markdown;base64,${encoded}`
      result.filename = `${releaseName}.md`
      return result
    }

    const pdfBuffer = await this.renderPdf(markdown)
    const encoded = pdfBuffer.toString('base64')
    result.url = `data:application/pdf;base64,${encoded}`
    result.filename = `${releaseName}.pdf`
    return result
  }

  private renderPdf(markdown: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const lines = markdown.split('\n')
      for (const line of lines) {
        if (line.startsWith('# ')) {
          doc.fontSize(16).font('Helvetica-Bold').text(stripInlineMarkdown(line.slice(2)))
          doc.moveDown(0.5)
        } else if (line.startsWith('## ')) {
          doc.fontSize(14).font('Helvetica-Bold').text(stripInlineMarkdown(line.slice(3)))
          doc.moveDown(0.3)
        } else if (line.startsWith('### ')) {
          doc.fontSize(12).font('Helvetica-Bold').text(stripInlineMarkdown(line.slice(4)))
          doc.moveDown(0.3)
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          doc.fontSize(11).font('Helvetica').text(`• ${stripInlineMarkdown(line.slice(2))}`, { indent: 20 })
        } else if (line.trim() === '') {
          doc.moveDown(0.5)
        } else {
          doc.fontSize(11).font('Helvetica').text(stripInlineMarkdown(line))
        }
      }

      doc.end()
    })
  }
}
