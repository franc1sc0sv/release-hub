import { Module } from '@nestjs/common'
import { IFlagHistoryRepository } from './interfaces/flag-history.repository'
import { FlagHistoryRepository } from './repositories/flag-history.repository'
import { IReleaseFlagDecisionRepository } from './interfaces/release-flag-decision.repository'
import { ReleaseFlagDecisionRepository } from './repositories/release-flag-decision.repository'

@Module({
  providers: [
    { provide: IFlagHistoryRepository, useClass: FlagHistoryRepository },
    { provide: IReleaseFlagDecisionRepository, useClass: ReleaseFlagDecisionRepository },
  ],
  exports: [IFlagHistoryRepository, IReleaseFlagDecisionRepository],
})
export class FlagHistoryModule {}
