# Validation

Input validation uses `class-validator` decorators on `@InputType()` classes. NestJS `ValidationPipe` validates automatically.

## Pattern

```typescript
@InputType()
export class CreateWidgetInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  tagIds: string[]
}
```

## Rules

- No Zod — use `class-validator` only
- Decorators go on the `@InputType()` class, co-located with the command
- `ValidationPipe` is enabled globally in `main.ts` with `whitelist: true` and `transform: true`
- Handlers receive already-validated input — no re-validation needed
- `whitelist: true` strips unknown properties
- `forbidNonWhitelisted: true` rejects requests with unknown properties
- `transform: true` auto-transforms plain objects to class instances
