import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IWebhookProjectSecrets } from './webhook-project.interfaces'

export abstract class IWebhookProjectRepository {
  abstract findWebhookSecrets: RepositoryMethod<[projectId: string], IWebhookProjectSecrets | null>
  abstract findProjectByRepoAndInstallation: RepositoryMethod<
    [fullName: string, installationId: number],
    string | null
  >
}
