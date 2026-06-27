---
name: nestjs-architecture
description: Release Hub backend architecture — CQRS, vertical slices, IoC, transactional handlers, GraphQL code-first. Use when creating modules, writing handlers/resolvers/repositories, or reviewing backend architecture.
metadata:
  category: backend
  extends: platform-backend
  tags:
  - nestjs
  - cqrs
  - graphql
  - architecture
  - ioc
  status: ready
  version: 1
---

# Principles

- Every operation goes through a transaction — commands AND queries
- Handlers depend on abstractions only — never import concrete classes
- Resolvers are thin — dispatch to CommandBus/QueryBus, zero business logic
- All domain types live in dedicated interface files — no inline declarations
- CASL authorization happens inside the handler, not in guards alone

# Rules

See [rules index](rules/_sections.md) for detailed patterns.

## Examples

### Positive Trigger

User: "Create the widgets module for Release Hub"
User: "Add a mutation to update a widget"
User: "Write a query handler for listing users"

### Negative Trigger

User: "Fix a CSS alignment issue" → not backend, skip this skill
User: "Update the Prisma schema" → database skill, not architecture
