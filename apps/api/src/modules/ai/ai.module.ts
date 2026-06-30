import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectModule } from '../project/project.module'
import { ReleaseModule } from '../release/release.module'
import { FeatureModule } from '../feature/feature.module'
import { AiResolver } from './resolvers/ai.resolver'
import { IAiProvider } from './interfaces/ai-provider.abstract'
import { IAiRepository } from './interfaces/ai.repository'
import { DevAiProvider } from './providers/dev-ai.provider'
import { AnthropicAiProvider } from './providers/anthropic-ai.provider'
import { AiRepository } from './repositories/ai.repository'
import { SuggestFeatureForPrHandler } from './queries/suggest-feature-for-pr/suggest-feature-for-pr.handler'
import { GenerateSummaryHandler } from './queries/generate-summary/generate-summary.handler'
import { AiDraftReleaseCreatedHandler } from './events/release-created.handler'
import { GeneratePrSummaryHandler } from './commands/generate-pr-summary/generate-pr-summary.handler'
import { RegenerateDraftHandler } from './commands/regenerate-draft/regenerate-draft.handler'
import { AiDraftRunner } from './services/ai-draft-runner.service'
import { AiBootstrapService } from './services/ai-bootstrap.service'

const AiProviderBinding = {
  provide: IAiProvider,
  useClass:
    process.env.NODE_ENV === 'development' ? DevAiProvider : AnthropicAiProvider,
}

@Module({
  imports: [CqrsModule, ProjectModule, ReleaseModule, FeatureModule],
  providers: [
    AiResolver,
    AiProviderBinding,
    { provide: IAiRepository, useClass: AiRepository },
    SuggestFeatureForPrHandler,
    GenerateSummaryHandler,
    AiDraftReleaseCreatedHandler,
    GeneratePrSummaryHandler,
    RegenerateDraftHandler,
    AiDraftRunner,
    AiBootstrapService,
  ],
})
export class AiModule {}
