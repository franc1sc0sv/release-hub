import type { IProjectUpdatedEvent } from './project.events'

export class ProjectUpdatedEvent implements IProjectUpdatedEvent {
  readonly eventName = 'project.updated' as const
  readonly occurredAt: Date

  constructor(readonly projectId: string) {
    this.occurredAt = new Date()
  }
}
