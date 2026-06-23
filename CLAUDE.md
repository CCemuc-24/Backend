# CLAUDE.md

Guidance for working in this repository. Full documentation lives in [`docs/`](./docs/) —
start at [docs/README.md](./docs/README.md). When adding features, follow
[docs/conventions.md](./docs/conventions.md).

## What this is

**CCemuc API** (`ccemuc-api`) — the REST backend for the CCemuc congress course-registration
and payment platform. Students register, browse course modules, pay for electives/workshops
through **Transbank Webpay Plus**, and are auto-enrolled (with a confirmation email) once
payment is authorized.

## Tech stack

- **Koa** + **TypeScript** (Node 16), HTTP API on port `3000`.
- **PostgreSQL** via **Sequelize** (`sequelize-typescript` decorator models).
- **transbank-sdk** (Webpay Plus, Production env) for payments; **nodemailer** for email.
- Auth = static bearer tokens (no JWT/sessions). Deploy via Docker Compose + nginx.

Details: [docs/tech-stack.md](./docs/tech-stack.md).

## Architecture (layered, per-entity)

```
index.ts → routes.ts → routes/<e>.routes.ts → middleware → controllers/<e>.controller.ts → models/<e>.model.ts → PostgreSQL
```

Four entities — **User, Course, Purchase, Enrollment** — each with the **same five files**:
`models/`, `interfaces/`, `controllers/`, `routes/`, plus registration in `routes.ts` and
`models/index.ts`. Controllers talk to models directly (no service layer); non-trivial logic
is extracted into **private controller methods** (see `PurchaseController`).

Details: [docs/architecture.md](./docs/architecture.md),
[docs/data-model.md](./docs/data-model.md).

## Commands

Run from `ccemuc-api/`:

```bash
npm run dev      # nodemon + ts-node hot reload
npm run build    # tsc → dist/
npm start        # node dist/index.js
npm run lint     # eslint .  (npm run lint:fix to autofix)
npx sequelize-cli db:migrate     # apply migrations
npx sequelize-cli db:seed:all    # seed course catalog
```

Whole stack (from repo root): `docker-compose up --build` → API at `http://localhost:3000`.
The container entrypoint (`start.sh`) runs migrate → seed → dev on boot.

> There is **no test framework** configured yet (`npm test` is a placeholder).

## Conventions for new features (must follow)

See [docs/conventions.md](./docs/conventions.md) for the full recipes. Essentials:

1. **Per-entity, five-file pattern.** A new entity needs `interfaces/x.interfaces.ts`,
   `models/x.model.ts` (UUID PK via `@PrimaryKey @Default(uuidv4)`), `controllers/x.controller.ts`,
   `routes/x.routes.ts`; then register the router in `src/routes.ts` and the model in
   `src/models/index.ts`.
2. **Controllers are thin.** Each method is `async (ctx: Context)`, wrapped in `try/catch`,
   sets `ctx.status` + `ctx.body`. Cast bodies to `Omit<XAttributes, 'id'>`. Extract growing
   logic into private methods. Bind methods in the constructor if they call each other
   (like `PurchaseController`).
3. **Error/status conventions:** `201` create · `200` read/update/already-exists · `204`
   delete · `404` not found · `409` `ValidationError` (include `field`) · `400` generic ·
   `403` auth · `500` unhandled.
4. **Auth:** guard `POST` with `authMiddleware`, `DELETE` with `deleteAuthMiddleware`
   (bearer token vs `AUTH_TOKEN` / `DELETE_AUTH_TOKEN`).
5. **Validation in the model** via Sequelize `validate`; pure helpers in `src/utils/`.
6. **Schema changes need a migration** (`src/migrations/`). `sequelize.sync()` is disabled —
   migrations are the source of truth. Keep model + interface + migration in sync.
7. **Match existing style**; don't propagate the known inconsistencies listed in
   [docs/conventions.md](./docs/conventions.md) (e.g. singular `purchase.interface.ts`,
   the `carrerYear` misspelling).

## Gotchas

- Webpay is wired to **Production** (`Environment.Production`) — the purchase flow hits the
  real gateway unless switched to `Environment.Integration`. See [docs/payments.md](./docs/payments.md).
- The purchase-confirm flow (mark paid → create enrollments → decrement capacity) is **not**
  wrapped in a DB transaction; capacity is checked at create but decremented at confirm.
- Secrets/config come from `env/ccemuc-api.env` and `env/db-ccemuc.env` (git-ignored). Var
  list in [docs/setup-and-deployment.md](./docs/setup-and-deployment.md).
- `exports/process_data.py` is a standalone reporting script, **not** part of the API.
