import { AppException } from './app.exception'
import { ErrorCode } from './error-codes.enum'

export class AiDisabledException extends AppException {
  constructor() {
    super('AI features are not available in this environment', ErrorCode.AI_DISABLED)
  }
}
