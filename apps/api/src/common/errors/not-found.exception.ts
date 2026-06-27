import { AppException } from './app.exception'
import { ErrorCode } from './error-codes.enum'

export class NotFoundException extends AppException {
  constructor(entity: string) {
    super(`${entity} not found`, ErrorCode.NOT_FOUND)
  }
}
