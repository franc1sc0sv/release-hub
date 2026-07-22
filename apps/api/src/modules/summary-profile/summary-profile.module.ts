import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectModule } from '../project/project.module'
import { OrganizationModule } from '../organization/organization.module'
import { SummaryProfileResolver } from './resolvers/summary-profile.resolver'
import { ISummaryProfileRepository } from './interfaces/summary-profile.repository'
import { SummaryProfileRepository } from './repositories/summary-profile.repository'
import { ListSummaryProfilesHandler } from './queries/list-summary-profiles/list-summary-profiles.handler'
import { GetSummaryProfileHandler } from './queries/get-summary-profile/get-summary-profile.handler'
import { CreateSummaryProfileHandler } from './commands/create-summary-profile/create-summary-profile.handler'
import { UpdateSummaryProfileHandler } from './commands/update-summary-profile/update-summary-profile.handler'
import { DeleteSummaryProfileHandler } from './commands/delete-summary-profile/delete-summary-profile.handler'

@Module({
  imports: [CqrsModule, ProjectModule, OrganizationModule],
  providers: [
    SummaryProfileResolver,
    { provide: ISummaryProfileRepository, useClass: SummaryProfileRepository },
    ListSummaryProfilesHandler,
    GetSummaryProfileHandler,
    CreateSummaryProfileHandler,
    UpdateSummaryProfileHandler,
    DeleteSummaryProfileHandler,
  ],
  exports: [ISummaryProfileRepository],
})
export class SummaryProfileModule {}
