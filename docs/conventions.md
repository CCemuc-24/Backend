# Conventions & How to Add a Feature

This is the canonical guide for building new features in `ccemuc-api` consistently with the
existing code. The root [`CLAUDE.md`](../CLAUDE.md) summarizes these rules for tooling.

## Guiding principles

1. **Follow the per-entity, five-file pattern.** Every domain entity has exactly one
   `model`, `interface`, `controller`, and `router`, wired into `routes.ts` + `models/index.ts`.
2. **Controllers are thin and own the HTTP contract.** They read `ctx`, validate, call the
   model (or external SDK), and set `ctx.status` / `ctx.body`. No separate service layer —
   extract **private methods on the controller** when logic grows (see `PurchaseController`).
3. **Models are the source of truth for shape and validation**, but every schema change must
   have a matching **migration**.
4. **Consistency over cleverness.** Match the naming, error-handling, and response shapes
   already in the codebase, even where they're imperfect. Note the known inconsistencies at
   the end and don't propagate new ones.

## Code style

- TypeScript `strict` mode. Avoid `any`; cast request bodies to the entity's
  `Omit<XAttributes, 'id'>` interface.
- 2-space indentation, single quotes, semicolons (match surrounding files).
- One default-exported class per controller; one default-exported `Router` per route file;
  one default-exported model class per model file.
- Keep imports grouped: framework → models → interfaces/enums/utils.
- `console.log`/`console.error` is the current logging approach (no logger library).

## Error-handling pattern (copy this exactly)

Every controller method wraps its body in `try/catch` and sets status + body. The standard
shapes:

```ts
async getById(ctx: Context) {
  try {
    const { id } = ctx.params;
    const item = await Model.findByPk(id);
    if (item) {
      ctx.body = item;
    } else {
      ctx.status = 404;
      ctx.body = { error: 'Model not found' };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
}
```

For `create`, distinguish Sequelize validation errors so the client gets the offending field:

```ts
} catch (error) {
  if (error instanceof ValidationError) {
    const field = error.errors[0].path;
    ctx.status = 409;
    ctx.body = { error: error.message, field };
  } else {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
}
```

Status-code conventions: `201` create, `200` read/update/already-exists, `204` delete,
`400` generic failure, `404` not found, `409` validation, `403` auth, `500` unhandled. See
[api-reference.md](./api-reference.md).

### "Find-or-return-existing" create

`User` and `Enrollment` (and `Purchase`) return an existing record with `200` instead of
erroring on a duplicate. Reuse this when a create should be idempotent on a natural key:

```ts
const existing = await Model.findOne({ where: { someUniqueKey } });
if (existing) { ctx.status = 200; ctx.body = existing; return; }
```

## Recipe: add a new entity (e.g. `Speaker`)

1. **Enum (if needed)** — `src/enums/<thing>.enum.ts` for any fixed value set.

2. **Interface** — `src/interfaces/speaker.interfaces.ts`:
   ```ts
   export interface SpeakerAttributes {
     id?: string;
     name: string;
     // ...
   }
   ```
   (Prefer the plural `*.interfaces.ts` filename.)

3. **Model** — `src/models/speaker.model.ts` using `sequelize-typescript` decorators. Start
   from the standard UUID PK block:
   ```ts
   @Table
   export default class Speaker extends Model {
     @PrimaryKey @Default(uuidv4)
     @Column({ type: DataType.UUID }) id!: string;

     @Column({ type: DataType.STRING, allowNull: false }) name!: string;
     // associations: @HasMany / @BelongsTo / @ForeignKey as needed
   }
   ```

4. **Register the model** — add it to the `models: [...]` array in
   [`src/models/index.ts`](../ccemuc-api/src/models/index.ts) (and import it).

5. **Controller** — `src/controllers/speaker.controller.ts`. Implement `create`, `getAll`,
   `getById`, `update`, `delete` following the error-handling pattern above. If methods call
   each other, **bind them in the constructor** (`this.create = this.create.bind(this)` …)
   like `PurchaseController`.

6. **Router** — `src/routes/speaker.routes.ts`:
   ```ts
   const router = new Router();
   const controller = new SpeakerController();
   router.post('/', authMiddleware, controller.create);
   router.get('/', controller.getAll);
   router.get('/:id', controller.getById);
   router.put('/:id', controller.update);
   router.delete('/:id', deleteAuthMiddleware, controller.delete);
   export default router;
   ```
   Apply `authMiddleware` to `POST` and `deleteAuthMiddleware` to `DELETE` (the established
   convention).

7. **Mount the router** — add a line to [`src/routes.ts`](../ccemuc-api/src/routes.ts):
   ```ts
   router.use('/speakers', speakerRoutes.routes(), speakerRoutes.allowedMethods());
   ```

8. **Migration** — scaffold and write the table:
   ```bash
   cd ccemuc-api && npx sequelize-cli migration:generate --name create-speakers
   ```
   Implement `up` (create table — include `createdAt`/`updatedAt`) and `down` (drop table),
   matching the existing migrations' style.

9. **Seeder (optional)** — `src/seeders/<timestamp>-speakers.ts` if you need initial data.

10. **Document it** — update [api-reference.md](./api-reference.md),
    [data-model.md](./data-model.md), and [project-structure.md](./project-structure.md).

## Recipe: add an endpoint to an existing entity

1. Add an `async` method to the controller following the error-handling pattern. If the
   controller binds methods (e.g. `PurchaseController`), add a bind line in the constructor.
2. Add the route to that entity's router file, with the appropriate middleware.
3. Extract shared logic into **private helper methods** on the controller rather than free
   functions, mirroring `PurchaseController`'s `validatePurchase` / `handleWebPayTransaction`.
4. Update [api-reference.md](./api-reference.md).

## Recipe: change a model's schema

1. Edit the model in `src/models/`.
2. Update the matching `*Attributes` interface in `src/interfaces/`.
3. Write a migration in `src/migrations/` (`addColumn`/`removeColumn`/`changeColumn` with a
   reversible `down`). Do **not** rely on `sequelize.sync()` — it is disabled in `index.ts`;
   the running schema comes from migrations executed in `start.sh`.
4. If the change affects seed data, update the seeder.

## Validation

- Put field-level validation in the **model** via Sequelize `validate` options (see the
  `rut` validator on `User`, which calls `utils/rutValidator.ts`). This makes validation
  fire on both create and update and surfaces as a `ValidationError` → `409`.
- Reusable, pure validation logic goes in `src/utils/`.

## Auth

- New mutating routes should be guarded: `authMiddleware` for create/action `POST`s,
  `deleteAuthMiddleware` for `DELETE`s. These compare a bearer token against `AUTH_TOKEN` /
  `DELETE_AUTH_TOKEN`.
- There is no per-user identity. If a feature needs real user auth, that's a larger
  architectural change — discuss before introducing JWT/sessions.

## External integrations

- Configure SDKs in the controller constructor (as `PurchaseController` does with
  `WebpayPlus.configureForProduction`). Read all secrets from `process.env` with a sensible
  fallback (`process.env.X || ''`).
- Multi-step external flows belong in private controller methods; consider wrapping
  DB-mutating sequences in a Sequelize transaction (the current purchase-confirm flow does
  **not** — see [payments.md](./payments.md) gotchas — improve this when you touch it).

## Known inconsistencies (don't propagate)

- `purchase.interface.ts` is singular; everything else is `*.interfaces.ts`. Use plural for new files.
- `carrerYear` is a misspelling of "career" baked into the schema — keep it as-is to avoid a
  breaking migration unless you intentionally rename it (model + interface + migration + frontend).
- Some success-on-duplicate flows return `200`; some validation flows return `409`. Match the
  closest existing analog for your case.
- No tests exist yet. If you add a test setup, document it in [tech-stack.md](./tech-stack.md).
