import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IWebhookProjectRepository } from '../interfaces/webhook-project.repository'
import type { IWebhookProjectSecrets } from '../interfaces/webhook-project.interfaces'

@Injectable()
export class WebhookProjectRepository extends IWebhookProjectRepository {
  findWebhookSecrets = async (projectId: string, tx: TxClient): Promise<IWebhookProjectSecrets | null> => {
    const row = await tx.project.findFirst({
      where: { id: projectId, deletedAt: null },
      select: { flagsmithWebhookSecret: true, githubWebhookSecret: true },
    })
    if (!row) return null
    return {
      flagsmithWebhookSecret: row.flagsmithWebhookSecret,
      githubWebhookSecret: row.githubWebhookSecret,
    }
  }
}
