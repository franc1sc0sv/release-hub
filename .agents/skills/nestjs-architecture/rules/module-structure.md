# Module Structure

Every domain lives under `apps/api/src/modules/[domain]/`:

```
modules/[domain]/
├── [domain].module.ts
├── interfaces/
│   ├── [entity].repository.interface.ts
│   └── [domain].interfaces.ts
├── repositories/
│   └── [entity].repository.ts
├── resolvers/
│   └── [resource].resolver.ts
├── commands/
│   └── [action]-[resource]/
│       ├── [action]-[resource].command.ts
│       ├── [action]-[resource].handler.ts
│       └── [action]-[resource].input.ts
├── queries/
│   └── [action]-[resource]/
│       ├── [action]-[resource].query.ts
│       ├── [action]-[resource].handler.ts
│       └── [action]-[resource].output.ts
├── events/
│   ├── [domain].events.ts
│   └── [action]-[entity].event.ts
└── types/
    └── [resource].type.ts
```

## Rules

- One module per domain (widgets, users, items, etc.)
- No cross-module direct imports — use exported abstractions or shared types
- No "service" files — use command/query handlers instead
- Each command/query gets its own folder with command + handler + input/output
- Module file wires IoC bindings: `{ provide: IXRepository, useClass: XRepository }`
