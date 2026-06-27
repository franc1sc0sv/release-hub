# Rules Index

1. [Module Structure](module-structure.md) — folder layout per domain
2. [IoC Pattern](ioc-pattern.md) — abstract classes as DI tokens
3. [Interfaces & Types](interfaces-types.md) — dedicated interface files
4. [Command Handler](command-handler.md) — BaseCommandHandler, transactions, events
5. [Query Handler](query-handler.md) — BaseQueryHandler, always transactional
6. [Repository Pattern](repository-pattern.md) — abstract + concrete, tx always required
7. [GraphQL Resolver](graphql-resolver.md) — thin resolvers, @ObjectType, @InputType
8. [CASL Policy](casl-policy.md) — authorization inside handlers
9. [Validation](validation.md) — class-validator on @InputType, ValidationPipe
10. [Error Handling](error-handling.md) — AppException extends GraphQLError
11. [Domain Events](domain-events.md) — event interfaces + IDomainEvent
12. [Naming Conventions](naming-conventions.md) — files, classes, methods
