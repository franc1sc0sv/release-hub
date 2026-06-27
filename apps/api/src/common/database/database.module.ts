import { Global, Module } from '@nestjs/common'
import { IDatabaseService } from './database.abstract'
import { PrismaDatabaseService } from './database.service'

@Global()
@Module({
  providers: [
    { provide: IDatabaseService, useClass: PrismaDatabaseService },
  ],
  exports: [IDatabaseService],
})
export class DatabaseModule {}
