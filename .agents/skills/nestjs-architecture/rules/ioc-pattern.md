# IoC Pattern

All dependencies are injected via abstract classes used as NestJS DI tokens.

## Global Abstractions (provided by global modules)

| Abstract | Concrete | Module |
|---|---|---|
| `IDatabaseService` | `PrismaDatabaseService` | `DatabaseModule` |
| `IEventEmitter` | `NestEventEmitter` | `EventModule` |

## Per-Module Abstractions

| Abstract | Concrete | Module |
|---|---|---|
| `IWidgetRepository` | `WidgetRepository` | `WidgetsModule` |
| `IUserRepository` | `UserRepository` | `UsersModule` |

## Rules

- Handlers constructor-inject abstractions, never concrete classes
- Abstract classes live in `interfaces/` folder of each module
- Concrete implementations live in `repositories/` folder
- Module wires binding: `{ provide: IXRepository, useClass: XRepository }`
- Export the abstract, not the concrete: `exports: [IXRepository]`
- When a handler needs a repo from another module, import that module and inject the abstract
