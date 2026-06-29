export type LogFields = Record<string, unknown>

export abstract class ILogger {
  abstract debug(fields: LogFields, message: string): void
  abstract info(fields: LogFields, message: string): void
  abstract warn(fields: LogFields, message: string): void
  abstract error(fields: LogFields, message: string): void
}
