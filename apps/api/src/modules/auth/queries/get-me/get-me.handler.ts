import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineGateAbility, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IAuthRepository } from '../../repositories/auth.repository.abstract'
import type { IAuthUser } from '../../interfaces/auth.interfaces'
import { GetMeQuery } from './get-me.query'

@QueryHandler(GetMeQuery)
export class GetMeHandler extends BaseQueryHandler<GetMeQuery, IAuthUser> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly authRepository: IAuthRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetMeQuery, tx: TxClient): Promise<IAuthUser> {
    const ability = defineGateAbility()

    if (!ability.can(Action.READ, Subject.USER)) {
      throw new ForbiddenException()
    }

    const user = await this.authRepository.findById(query.userId, tx)

    if (!user) {
      throw new NotFoundException('User')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    }
  }
}
