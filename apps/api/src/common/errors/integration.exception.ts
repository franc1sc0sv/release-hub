import { AppException } from './app.exception'
import { ErrorCode } from './error-codes.enum'

export class IntegrationException extends AppException {
  constructor(message: string) {
    super(message, ErrorCode.INTEGRATION_ERROR)
  }
}
