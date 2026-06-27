import { AppException } from './app.exception'
import { ErrorCode } from './error-codes.enum'

export class ConflictException extends AppException {
  constructor(message: string) {
    super(message, ErrorCode.CONFLICT)
  }
}
