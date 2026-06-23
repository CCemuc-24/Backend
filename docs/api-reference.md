# API Reference

Base URL (local): `http://localhost:3000`
Base URL (prod): behind nginx at `api.ccemuc.cl`.

All bodies are JSON. Responses are Sequelize model instances serialized as JSON, or
`{ error: string }` (sometimes with a `field`) on failure.

## Authentication

Two static-bearer-token middlewares guard mutating routes:

- **`authMiddleware`** — requires `Authorization: Bearer <AUTH_TOKEN>`. Applied to `POST`
  routes (create, confirm, sendConfirmation).
- **`deleteAuthMiddleware`** — requires `Authorization: Bearer <DELETE_AUTH_TOKEN>`. Applied
  to `DELETE` routes.

If the token is missing or wrong, the middleware short-circuits with `403 { error:
"Unauthorized" }`. `GET` and `PUT` routes are currently **unauthenticated**.

## Common status codes

| Code | Meaning in this API |
|------|---------------------|
| `200` | OK (read, update, or already-existing resource on create) |
| `201` | Created |
| `204` | Deleted (no content) |
| `400` | Bad request / generic create failure |
| `402` | Payment error (Webpay transaction `ERROR`) |
| `403` | Unauthorized (bad/missing token) |
| `404` | Resource not found |
| `409` | Sequelize `ValidationError` (e.g. duplicate unique field, invalid RUT) — body includes `field` |
| `500` | Unhandled server error |

---

## Users — `/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/users` | `authMiddleware` | Create user. If a user with the same `rut` exists, returns it with `200` instead of creating. |
| GET | `/users` | — | List all users |
| GET | `/users/:id` | — | Get user by id |
| GET | `/users/rut/:rut` | — | Get user by RUT |
| PUT | `/users/:id` | — | Update user |
| DELETE | `/users/:id` | `deleteAuthMiddleware` | Delete user |

Create body (`Omit<UserAttributes,'id'>`): `names`, `lastNames`, `rut`, `email`,
`university`, `carrerYear`.

---

## Courses — `/courses`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/courses` | `authMiddleware` | Create course |
| GET | `/courses` | — | List all courses |
| GET | `/courses/:id` | — | Get course by id |
| PUT | `/courses/:id` | — | Update course |
| DELETE | `/courses/:id` | `deleteAuthMiddleware` | Delete course |

Create body (`Omit<CourseAttributes,'id'>`): `title`, `module`, `type`, `price`, `capacity`,
`week`, optional `features`, optional `topics`.

---

## Enrollments — `/enrollments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/enrollments` | `authMiddleware` | Create enrollment. Returns existing one (`200`) if `(userId, courseId)` already enrolled. |
| GET | `/enrollments` | — | List all enrollments |
| GET | `/enrollments/:id` | — | Get enrollment by id |
| PUT | `/enrollments/:id` | — | Update enrollment |
| DELETE | `/enrollments/:id` | `deleteAuthMiddleware` | Delete enrollment |

Create body (`Omit<EnrollmentAttributes,'id'>`): `userId`, `courseId`, `purchaseId`.

> Enrollments are normally created automatically by the purchase-confirmation flow; this
> resource exists for administrative/manual use.

---

## Purchases — `/purchases`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/purchases` | `authMiddleware` | Create a purchase and start a Webpay transaction. Returns `{ purchase, webPayResponse }`. |
| GET | `/purchases` | — | List all purchases |
| GET | `/purchases/:id` | — | Get purchase by id |
| PUT | `/purchases/:id` | — | Update purchase |
| DELETE | `/purchases/:id` | `deleteAuthMiddleware` | Delete purchase |
| POST | `/purchases/confirm/:id` | `authMiddleware` | Confirm payment with `{ token_ws }`; on `AUTHORIZED`, marks paid + creates enrollments. |
| GET | `/purchases/statusToken/:token` | — | Commit/inspect a Webpay token, return its transaction status |
| GET | `/purchases/getUserPurchase/:userId` | — | List all purchases for a user |
| POST | `/purchases/sendConfirmation` | `authMiddleware` | Send a confirmation email: `{ purchaseId, email, subject, text }` (`text` is HTML) |

Create body (`Omit<PurchaseAttributes,'id'>`): `userId`, `coursesIds: string[]`.

The full payment lifecycle (validation → Webpay create → user pays → confirm → enroll →
email) is documented in [payments.md](./payments.md).
