import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectModule } from '../project/project.module'
import { ReleaseModule } from '../release/release.module'
import { ProjectTagModule } from '../project-tag/project-tag.module'
import { OrganizationModule } from '../organization/organization.module'
import { FeatureResolver } from './resolvers/feature.resolver'
import { IFeatureRepository } from './interfaces/feature.repository'
import { FeatureRepository } from './repositories/feature.repository'
import { IFeatureInReleaseRepository } from './interfaces/feature-in-release.repository'
import { FeatureInReleaseRepository } from './repositories/feature-in-release.repository'
import { IFeatureStateEventRepository } from './interfaces/feature-state-event.repository'
import { FeatureStateEventRepository } from './repositories/feature-state-event.repository'
import { SetFeatureReleaseStateHandler } from './commands/set-feature-release-state/set-feature-release-state.handler'
import { ListFeaturesPageHandler } from './queries/list-features-page/list-features-page.handler'
import { GetFeatureHandler } from './queries/get-feature/get-feature.handler'
import { CreateFeatureHandler } from './commands/create-feature/create-feature.handler'
import { AssignPrToFeatureHandler } from './commands/assign-pr-to-feature/assign-pr-to-feature.handler'
import { SetFeatureStateHandler } from './commands/set-feature-state/set-feature-state.handler'
import { SetFeatureTagsHandler } from './commands/set-feature-tags/set-feature-tags.handler'
import { AcceptSuggestedFeatureHandler } from './commands/accept-suggested-feature/accept-suggested-feature.handler'
import { RejectSuggestedFeatureHandler } from './commands/reject-suggested-feature/reject-suggested-feature.handler'
import { DeleteFeatureHandler } from './commands/delete-feature/delete-feature.handler'

@Module({
  imports: [CqrsModule, ProjectModule, ReleaseModule, ProjectTagModule, OrganizationModule],
  providers: [
    FeatureResolver,
    { provide: IFeatureRepository, useClass: FeatureRepository },
    { provide: IFeatureInReleaseRepository, useClass: FeatureInReleaseRepository },
    { provide: IFeatureStateEventRepository, useClass: FeatureStateEventRepository },
    ListFeaturesPageHandler,
    GetFeatureHandler,
    CreateFeatureHandler,
    AssignPrToFeatureHandler,
    SetFeatureStateHandler,
    SetFeatureReleaseStateHandler,
    SetFeatureTagsHandler,
    AcceptSuggestedFeatureHandler,
    RejectSuggestedFeatureHandler,
    DeleteFeatureHandler,
  ],
  exports: [IFeatureRepository],
})
export class FeatureModule {}
