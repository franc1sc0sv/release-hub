import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectModule } from '../project/project.module'
import { ProjectTagResolver } from './resolvers/project-tag.resolver'
import { IProjectTagRepository } from './interfaces/project-tag.repository'
import { ProjectTagRepository } from './repositories/project-tag.repository'
import { ListProjectTagsHandler } from './queries/list-project-tags/list-project-tags.handler'
import { CreateProjectTagHandler } from './commands/create-project-tag/create-project-tag.handler'
import { DeleteProjectTagHandler } from './commands/delete-project-tag/delete-project-tag.handler'

@Module({
  imports: [CqrsModule, ProjectModule],
  providers: [
    ProjectTagResolver,
    { provide: IProjectTagRepository, useClass: ProjectTagRepository },
    ListProjectTagsHandler,
    CreateProjectTagHandler,
    DeleteProjectTagHandler,
  ],
  exports: [IProjectTagRepository],
})
export class ProjectTagModule {}
