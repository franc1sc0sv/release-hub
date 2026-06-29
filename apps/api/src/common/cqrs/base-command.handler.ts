import { PreparedCommandHandler } from './prepared-command.handler'

export abstract class BaseCommandHandler<TCommand, TResult = void>
  extends PreparedCommandHandler<TCommand, void, TResult>
{
  protected prepare(): Promise<void> {
    return Promise.resolve()
  }
}
