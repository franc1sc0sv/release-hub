import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import { randomBytes } from 'crypto'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { LinearConnectionStatus } from '../types/linear-connection-status.type'
import { GetLinearConnectionQuery } from '../queries/get-linear-connection/get-linear-connection.query'
import { CheckLinearAuthorizeQuery } from '../queries/check-linear-authorize/check-linear-authorize.query'
import { DisconnectLinearCommand } from '../commands/disconnect-linear/disconnect-linear.command'
import { ILinearOAuthStateRepository } from '../interfaces/linear-oauth-state.repository'
import { LINEAR_OAUTH_STATE_TTL_MINUTES } from '../linear-auth.constants'

@Resolver()
@UseGuards(JwtAuthGuard)
export class LinearAuthResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
    private readonly db: IDatabaseService,
    private readonly oauthStateRepository: ILinearOAuthStateRepository,
  ) {}

  @Query(() => String)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.PROJECT)
  async linearAuthorizeUrl(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<string> {
    await this.queryBus.execute(new CheckLinearAuthorizeQuery(projectId, user.id))

    const clientId = process.env.LINEAR_CLIENT_ID!
    const callbackUrl =
      process.env.LINEAR_CALLBACK_URL ?? 'http://localhost:3001/auth/linear/callback'

    const stateValue = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + LINEAR_OAUTH_STATE_TTL_MINUTES * 60 * 1000)

    await this.db.$transaction((tx) =>
      this.oauthStateRepository.create(
        { nonce: stateValue, userId: user.id, projectId, expiresAt },
        tx,
      ),
    )

    const signedState = this.jwtService.sign(
      { sub: user.id, projectId, nonce: stateValue },
      { expiresIn: `${LINEAR_OAUTH_STATE_TTL_MINUTES}m` },
    )

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'read',
      state: signedState,
      actor: 'user',
      prompt: 'consent',
    })

    return `https://linear.app/oauth/authorize?${params.toString()}`
  }

  @Query(() => LinearConnectionStatus)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.PROJECT)
  linearConnection(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<LinearConnectionStatus> {
    return this.queryBus.execute(new GetLinearConnectionQuery(projectId, user.id))
  }

  @Mutation(() => Boolean)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.PROJECT)
  disconnectLinear(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new DisconnectLinearCommand(projectId, user.id))
  }
}
