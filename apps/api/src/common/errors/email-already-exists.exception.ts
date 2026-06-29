import { AppException } from './app.exception'
import { ErrorCode } from './error-codes.enum'

export class EmailAlreadyExistsException extends AppException {
  constructor() {
    super('An account with this email already exists.', ErrorCode.EMAIL_ALREADY_EXISTS)
  }
}
