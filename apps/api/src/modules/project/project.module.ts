import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectResolver } from './resolvers/project.resolver'
import { IProjectRepository } from './interfaces/project.repository'
import { ProjectRepository } from './repositories/project.repository'
import { ListProjectsHandler } from './queries/list-projects/list-projects.handler'
import { GetProjectHandler } from './queries/get-project/get-project.handler'
import { CreateProjectHandler } from './commands/create-project/create-project.handler'
import { UpdateProjectHandler } from './commands/update-project/update-project.handler'
import { DeleteProjectHandler } from './commands/delete-project/delete-project.handler'

@Module({
  imports: [CqrsModule],
  providers: [
    ProjectResolver,
    { provide: IProjectRepository, useClass: ProjectRepository },
    ListProjectsHandler,
    GetProjectHandler,
    CreateProjectHandler,
    UpdateProjectHandler,
    DeleteProjectHandler,
  ],
  exports: [IProjectRepository],
})
export class ProjectModule {}
