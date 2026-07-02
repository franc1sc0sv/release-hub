import type { Request } from 'express'

export interface IRawBodyRequest extends Request {
  rawBody?: Buffer
}
