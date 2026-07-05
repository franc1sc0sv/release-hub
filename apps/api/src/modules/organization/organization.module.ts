import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { OrganizationResolver } from './resolvers/organization.resolver'
import { IOrganizationRepository } from './interfaces/organization.repository'
import { OrganizationRepository } from './repositories/organization.repository'
import { GetMyOrganizationsHandler } from './queries/get-my-organizations/get-my-organizations.handler'
import { GetOrganizationHandler } from './queries/get-organization/get-organization.handler'
import { ListOrgMembersHandler } from './queries/list-org-members/list-org-members.handler'
import { CreateOrganizationHandler } from './commands/create-organization/create-organization.handler'
import { UpdateOrganizationHandler } from './commands/update-organization/update-organization.handler'
import { DeleteOrganizationHandler } from './commands/delete-organization/delete-organization.handler'

@Module({
  imports: [CqrsModule],
  providers: [
    OrganizationResolver,
    { provide: IOrganizationRepository, useClass: OrganizationRepository },
    GetMyOrganizationsHandler,
    GetOrganizationHandler,
    ListOrgMembersHandler,
    CreateOrganizationHandler,
    UpdateOrganizationHandler,
    DeleteOrganizationHandler,
  ],
  exports: [IOrganizationRepository],
})
export class OrganizationModule {}
