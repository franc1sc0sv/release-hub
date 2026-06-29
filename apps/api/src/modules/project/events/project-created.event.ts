import type { IProjectCreatedEvent } from './project.events'

export class ProjectCreatedEvent implements IProjectCreatedEvent {
  readonly eventName = 'project.created' as const
  readonly occurredAt: Date

  constructor(readonly projectId: string) {
    this.occurredAt = new Date()
  }
}
