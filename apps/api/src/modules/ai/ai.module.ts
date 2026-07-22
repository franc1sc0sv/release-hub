import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ReleaseModule } from '../release/release.module'
import { FeatureModule } from '../feature/feature.module'
import { OrganizationModule } from '../organization/organization.module'
import { SummaryProfileModule } from '../summary-profile/summary-profile.module'
import { AiResolver } from './resolvers/ai.resolver'
import { IAiProvider } from './interfaces/ai-provider.abstract'
import { IAiRepository } from './interfaces/ai.repository'
import { DevAiProvider } from './providers/dev-ai.provider'
import { AnthropicAiProvider } from './providers/anthropic-ai.provider'
import { AiRepository } from './repositories/ai.repository'
import { SuggestFeatureForPrHandler } from './queries/suggest-feature-for-pr/suggest-feature-for-pr.handler'
import { AiDraftReleaseCreatedHandler } from './events/release-created.handler'
import { AiDraftReleaseResyncedHandler } from './events/release-resynced.handler'
import { AiSummaryReleaseRequestedHandler } from './events/release-summary-requested.handler'
import { GeneratePrSummaryHandler } from './commands/generate-pr-summary/generate-pr-summary.handler'
import { RegenerateDraftHandler } from './commands/regenerate-draft/regenerate-draft.handler'
import { StartSummaryGenerationHandler } from './commands/start-summary-generation/start-summary-generation.handler'
import { AiDraftRunner } from './services/ai-draft-runner.service'
import { AiSummaryRunner } from './services/ai-summary-runner.service'
import { AiBootstrapService } from './services/ai-bootstrap.service'
import { isAiEnabled } from '../../common/config/ai-availability'

const AiProviderBinding = {
  provide: IAiProvider,
  useClass: isAiEnabled() ? DevAiProvider : AnthropicAiProvider,
}

@Module({
  imports: [CqrsModule, ReleaseModule, FeatureModule, OrganizationModule, SummaryProfileModule],
  providers: [
    AiResolver,
    AiProviderBinding,
    { provide: IAiRepository, useClass: AiRepository },
    SuggestFeatureForPrHandler,
    AiDraftReleaseCreatedHandler,
    AiDraftReleaseResyncedHandler,
    AiSummaryReleaseRequestedHandler,
    GeneratePrSummaryHandler,
    RegenerateDraftHandler,
    StartSummaryGenerationHandler,
    AiDraftRunner,
    AiSummaryRunner,
    AiBootstrapService,
  ],
})
export class AiModule {}
