# Naming Conventions

## Files

| Type | Pattern | Example |
|---|---|---|
| Module | `[domain].module.ts` | `widgets.module.ts` |
| Resolver | `[resource].resolver.ts` | `widget.resolver.ts` |
| Command | `[action]-[resource].command.ts` | `create-widget.command.ts` |
| Command Handler | `[action]-[resource].handler.ts` | `create-widget.handler.ts` |
| Command Input | `[action]-[resource].input.ts` | `create-widget.input.ts` |
| Query | `[action]-[resource].query.ts` | `list-widgets.query.ts` |
| Query Handler | `[action]-[resource].handler.ts` | `list-widgets.handler.ts` |
| Query Output | `[action]-[resource].output.ts` | `list-widgets.output.ts` |
| Repository Interface | `[entity].repository.interface.ts` | `widget.repository.interface.ts` |
| Repository Impl | `[entity].repository.ts` | `widget.repository.ts` |
| Domain Interfaces | `[domain].interfaces.ts` | `widgets.interfaces.ts` |
| Event Interface | `[domain].events.ts` | `widgets.events.ts` |
| Event Class | `[action]-[entity].event.ts` | `widget-created.event.ts` |
| GraphQL Type | `[resource].type.ts` | `widget.type.ts` |

## Classes

| Type | Pattern | Example |
|---|---|---|
| Module | `[Domain]Module` | `WidgetsModule` |
| Resolver | `[Resource]Resolver` | `WidgetResolver` |
| Command | `[Action][Resource]Command` | `CreateWidgetCommand` |
| Handler | `[Action][Resource]Handler` | `CreateWidgetHandler` |
| Input DTO | `[Action][Resource]Input` | `CreateWidgetInput` |
| Query | `[Action][Resource]Query` | `ListWidgetsQuery` |
| Repository Abstract | `I[Entity]Repository` | `IWidgetRepository` |
| Repository Concrete | `[Entity]Repository` | `WidgetRepository` |
| Domain Interface | `I[Entity]` | `IWidget` |
| Event Interface | `I[Action][Entity]Event` | `IWidgetCreatedEvent` |
| Event Class | `[Action][Entity]Event` | `WidgetCreatedEvent` |
| GraphQL Type | `[Resource]Type` | `WidgetType` |

## General

- Files: kebab-case
- Classes: PascalCase
- Interfaces: `I` prefix
- Folders: kebab-case, plural for collections (commands, queries, events, types)
- Domain module folder: plural (widgets, users, items)
- Command/query subfolder: kebab-case action-resource (create-widget, list-widgets)
