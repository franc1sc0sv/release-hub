import { AppException } from './app.exception'
import { ErrorCode } from './error-codes.enum'

export class ForbiddenException extends AppException {
  constructor() {
    super('Forbidden', ErrorCode.FORBIDDEN)
  }
}
