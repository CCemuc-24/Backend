# Data Model

The domain has **four entities**. All use a UUID v4 primary key (`@Default(uuidv4)`) and
inherit Sequelize's automatic `createdAt` / `updatedAt` timestamps.

## Entity-relationship diagram

```
┌───────────┐         ┌──────────────┐         ┌────────────┐
│   User    │1       *│  Enrollment  │*       1│   Course   │
│           ├─────────┤              ├─────────┤            │
│ id (PK)   │         │ id (PK)      │         │ id (PK)    │
│ names     │         │ userId  (FK) │         │ title      │
│ lastNames │         │ courseId(FK) │         │ module     │
│ rut  (uq) │         │ purchaseId   │         │ type       │
│ email(uq) │         │       (FK)   │         │ price      │
│ university│         └──────┬───────┘         │ capacity   │
│ carrerYear│                │ *               │ features   │
└─────┬─────┘                │                 │ week       │
      │1                     │1                │ topics     │
      │                ┌─────┴──────┐          └────────────┘
      │*               │  Purchase  │
      └────────────────┤            │
                       │ id (PK)    │
                       │ userId(FK) │
                       │ buyOrder   │
                       │ isPaid     │
                       │ coursesIds │  ← UUID[] (denormalized)
                       └────────────┘
```

### Relationships

- `User` **has many** `Enrollment` and `Purchase` (both `onDelete: CASCADE`).
- `Course` **has many** `Enrollment` (`onDelete: CASCADE`).
- `Purchase` **has many** `Enrollment` (`onDelete: CASCADE`).
- `Enrollment` **belongs to** `User`, `Course` and `Purchase`.
- `Enrollment` has a **composite unique constraint** on `(userId, courseId)` (named
  `UserCourseUnique`) — a user cannot enroll in the same course twice.
- `Purchase.coursesIds` is a **denormalized `UUID[]` array** of the courses being bought.
  The normalized link is `Enrollment`, created only after payment is authorized.

## Entities

### User — [`models/user.model.ts`](../ccemuc-api/src/models/user.model.ts)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | PK, default uuidv4 |
| `names` | STRING | not null |
| `lastNames` | STRING | not null |
| `rut` | STRING | not null, **unique**, validated via `isRut()` |
| `email` | STRING | not null, **unique** |
| `university` | STRING | not null |
| `carrerYear` | INTEGER | not null |

The `rut` column carries a custom validator (`utils/rutValidator.ts`) that runs on
insert/update and throws a `ValidationError` if the Chilean RUT (incl. check digit) is invalid.

### Course — [`models/course.model.ts`](../ccemuc-api/src/models/course.model.ts)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | PK |
| `title` | STRING | not null |
| `module` | INTEGER | not null |
| `type` | ENUM(`core`,`elective`,`workshop`) | not null — see `CourseType` |
| `price` | INTEGER | not null (CLP, integer pesos) |
| `capacity` | INTEGER | not null (remaining seats; decremented on enrollment) |
| `features` | JSONB | nullable, key→value map (modality, place, date, schedule…) |
| `week` | INTEGER | not null |
| `topics` | STRING[] | nullable, list of topic titles |

`CourseType` ([`enums/course-type.enum.ts`](../ccemuc-api/src/enums/course-type.enum.ts)):
- `core` — included for everyone; auto-enrolled on any paid purchase.
- `elective` — paid module.
- `workshop` — paid workshop.

### Purchase — [`models/purchase.model.ts`](../ccemuc-api/src/models/purchase.model.ts)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | PK |
| `userId` | UUID | FK → User, not null |
| `buyOrder` | STRING | nullable; auto-generated in a `@BeforeCreate` hook (26-char SHA-256 prefix) — this is the Transbank order id |
| `isPaid` | BOOLEAN | not null, default `false` |
| `coursesIds` | UUID[] | not null — the courses in this cart |

The `@BeforeCreate` hook (`generateBuyOrder`) derives a unique 26-character `buyOrder` from a
timestamp + random string, hashed with SHA-256. Transbank requires a unique buy order per
transaction.

### Enrollment — [`models/enrollment.model.ts`](../ccemuc-api/src/models/enrollment.model.ts)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | PK |
| `userId` | UUID | FK → User, not null, part of `UserCourseUnique` |
| `courseId` | UUID | FK → Course, not null, part of `UserCourseUnique` |
| `purchaseId` | UUID | FK → Purchase, not null |

Created automatically by `PurchaseController.createEnrollments` after a purchase is
authorized — one row per purchased course **plus** one per `core` course.

## Migrations

Schema changes live in [`ccemuc-api/src/migrations/`](../ccemuc-api/src/migrations/) as
timestamped `sequelize-cli` files (`up`/`down`). History so far:

| Timestamp | Migration |
|-----------|-----------|
| `20240717185315` | create-users |
| `20240717185323` | create-courses |
| `20240717185330` | create-purchases |
| `20240720213316` | add-buy-order-to-purchases |
| `20240720214936` | remove-confirmationCode-from-purchase |
| `20240725191045` | remove-userId-and-courseId-from-Purchase |
| `20240725191142` | create-enrollments |
| `20240725193457` | add-userId-to-purchases |
| `20240725193822` | add-coursesIds-to-purchases |

These show the design evolving from a per-course `Purchase` (with `userId`/`courseId`) toward
a cart-style `Purchase` (`coursesIds` array) with a separate `Enrollment` join table.

> **Models are the source of truth at runtime**, but migrations are the source of truth for
> the actual table shape. Keep them in sync: when you change a model column, write a matching
> migration. Note that `config/database.ts` sets `synchronize: true`, but `sequelize.sync()`
> is **commented out** in `index.ts` — so in practice the schema is driven by migrations
> (`start.sh` runs `db:migrate` then `db:seed:all` on boot).

## Seeders

[`seeders/20240716203436-courses.ts`](../ccemuc-api/src/seeders/20240716203436-courses.ts)
seeds the course catalog (surgery modules, anesthesiology, workshops, …) with `features`
and `topics`. It calls `sequelize.sync()` then `Course.create()` per course.
