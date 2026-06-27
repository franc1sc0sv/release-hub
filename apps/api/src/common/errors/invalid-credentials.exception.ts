import { AppException } from './app.exception'
import { ErrorCode } from './error-codes.enum'

export class InvalidCredentialsException extends AppException {
  constructor() {
    super('Invalid credentials', ErrorCode.INVALID_CREDENTIALS)
  }
}
