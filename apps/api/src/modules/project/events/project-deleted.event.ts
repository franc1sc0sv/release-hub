import type { IProjectDeletedEvent } from './project.events'

export class ProjectDeletedEvent implements IProjectDeletedEvent {
  readonly eventName = 'project.deleted' as const
  readonly occurredAt: Date

  constructor(readonly projectId: string) {
    this.occurredAt = new Date()
  }
}
