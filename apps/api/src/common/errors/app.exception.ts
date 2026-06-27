import { GraphQLError } from 'graphql'
import { ErrorCode } from './error-codes.enum'

export class AppException extends GraphQLError {
  constructor(message: string, code: ErrorCode) {
    super(message, { extensions: { code } })
  }
}
