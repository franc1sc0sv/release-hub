# Error Handling

Custom exceptions extend `GraphQLError` via `AppException` base class. All error codes are typed via the `ErrorCode` enum — never use raw strings.

## Hierarchy

```
GraphQLError (graphql)
  └── AppException (common/errors/)
        ├── NotFoundException
        ├── ForbiddenException
        ├── UnauthorizedException
        └── ConflictException
```

## ErrorCode Enum (`common/errors/error-codes.enum.ts`)

```typescript
export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}
```

## Classes (in `common/errors/`)

```typescript
export class AppException extends GraphQLError {
  constructor(message: string, code: ErrorCode) {
    super(message, { extensions: { code } })
  }
}

export class NotFoundException extends AppException {
  constructor(entity: string) {
    super(`${entity} not found`, ErrorCode.NOT_FOUND)
  }
}

export class ForbiddenException extends AppException {
  constructor() {
    super('Forbidden', ErrorCode.FORBIDDEN)
  }
}

export class UnauthorizedException extends AppException {
  constructor() {
    super('Invalid credentials', ErrorCode.INVALID_CREDENTIALS)
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(message, ErrorCode.CONFLICT)
  }
}
```

## Rules

- Always throw domain exceptions from `common/errors/` — never NestJS built-ins
- Always use `ErrorCode` enum values — never raw strings as the `code` parameter
- `NotFoundException` takes the entity name: `throw new NotFoundException('Widget')`
- `ForbiddenException` is parameterless — used after CASL check failure
- `UnauthorizedException` is parameterless — used for invalid credentials
- `ConflictException` takes a message: `throw new ConflictException('Email already in use')`
- Add new `ErrorCode` values and subclasses as new domains require them
- Exceptions thrown inside `$transaction` will roll back the transaction automatically
