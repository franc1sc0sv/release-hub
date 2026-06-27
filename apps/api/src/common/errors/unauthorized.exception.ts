import { AppException } from './app.exception'
import { ErrorCode } from './error-codes.enum'

export class UnauthenticatedException extends AppException {
  constructor() {
    super('Unauthenticated', ErrorCode.UNAUTHENTICATED)
  }
}
