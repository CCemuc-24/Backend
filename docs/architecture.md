# Architecture

## Overview

`ccemuc-api` is a small, single-service **REST API** built on **Koa**. It follows a classic
layered MVC-ish structure where each domain entity owns the same set of layers:

```
HTTP request
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│ Koa app (src/index.ts)                                          │
│   cors → bodyParser → root router                               │
└──────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│ Root router (src/routes.ts)                                     │
│   mounts /users /courses /purchases /enrollments                │
└──────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│ Resource router (src/routes/<entity>.routes.ts)                 │
│   maps verbs+paths → controller methods, applies middleware     │
└──────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│ Middleware (src/middleware/*)                                   │
│   authMiddleware / deleteAuthMiddleware (static bearer token)   │
└──────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│ Controller (src/controllers/<entity>.controller.ts)            │
│   reads ctx, validates, orchestrates, sets ctx.status/body     │
└──────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│ Model (src/models/<entity>.model.ts)  — sequelize-typescript    │
│   table mapping, validations, hooks, associations               │
└──────────────────────────────────────────────────────────────┘
   │
   ▼
            PostgreSQL  ◄── migrations / seeders
```

External integrations hang off the controller layer:

- **Transbank Webpay Plus** (`transbank-sdk`) — called from `PurchaseController`.
- **SMTP / Nodemailer** — called from `PurchaseController.sendConfirmation`.

## Layers and responsibilities

| Layer | Folder | Responsibility |
|-------|--------|----------------|
| Entry point | `src/index.ts` | Build the Koa app, register global middleware, authenticate the DB, start listening |
| Root router | `src/routes.ts` | Mount each resource router under its base path |
| Resource routers | `src/routes/` | Bind HTTP verb + path to a controller method and attach auth middleware |
| Middleware | `src/middleware/` | Cross-cutting concerns; today only static-token auth |
| Controllers | `src/controllers/` | Request handling: parse `ctx`, validate, call models / external services, shape the response |
| Models | `src/models/` | Sequelize entity definitions, column types, validations, hooks, associations |
| Interfaces | `src/interfaces/` | TypeScript shapes (`*Attributes`) used to type request bodies |
| Enums | `src/enums/` | Shared enumerations (e.g. `CourseType`) |
| Utils | `src/utils/` | Pure helpers (e.g. Chilean RUT validation) |
| Config | `src/config/` | Environment-driven configuration (database) |
| Migrations | `src/migrations/` | Versioned schema changes run by `sequelize-cli` |
| Seeders | `src/seeders/` | Initial / demo data |

## Request lifecycle (typical CRUD)

1. Koa receives the request; global `cors()` and `bodyParser()` run.
2. The root router matches the base path and delegates to the resource router.
3. The resource router matches the verb+path. For mutating routes it first runs
   `authMiddleware` (or `deleteAuthMiddleware` for `DELETE`).
4. The controller method runs inside a `try/catch`:
   - Cast `ctx.request.body` to the entity's `Omit<XAttributes, 'id'>` interface.
   - Perform the operation via the Sequelize model.
   - Set `ctx.status` and `ctx.body`.
   - On error, map known errors (e.g. `ValidationError` → `409`) and fall back to `400`/`500`.

## Key architectural characteristics

- **One controller class per entity**, instantiated once per resource router. Methods are
  `async (ctx: Context)`.
- **Controllers talk to models directly** — there is no separate service/repository layer.
  The exception is `PurchaseController`, which is large enough that it extracts private
  helper methods (`validatePurchase`, `handleWebPayTransaction`, `createEnrollments`, …) to
  keep `create`/`confirm` readable. This is the de-facto pattern for non-trivial logic.
- **Method binding:** controllers whose methods are passed as helpers/callbacks (notably
  `PurchaseController`) bind every method in the constructor (`this.x = this.x.bind(this)`)
  so `this` is preserved. Simple CRUD controllers (`User`, `Course`, `Enrollment`) don't
  need this because their methods don't reference other instance methods.
- **No DTO mapping / serialization layer** — Sequelize model instances are returned
  directly as JSON in the response body.
- **Auth is intentionally minimal:** a shared secret bearer token, compared against an env
  var. There is no per-user identity, session, or JWT.
- **Stateless service:** all state lives in PostgreSQL; the API can be horizontally scaled
  behind nginx.

See [data-model.md](./data-model.md) for entity relationships and
[payments.md](./payments.md) for the one stateful, multi-step flow (purchase → pay → enroll).
