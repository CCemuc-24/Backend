# Payments — Webpay Plus & Email Confirmation

All payment logic lives in
[`controllers/purchase.controller.ts`](../ccemuc-api/src/controllers/purchase.controller.ts)
using the **Transbank `transbank-sdk`** in the **Production** environment.

## Configuration

The `PurchaseController` constructor configures the SDK once:

```ts
WebpayPlus.configureForProduction(process.env.COMMERCE_CODE || '', process.env.API_KEY_TB || '');
```

Each transaction is also created with an explicit `Options(COMMERCE_CODE, API_KEY_TB,
Environment.Production)`. Required env vars: `COMMERCE_CODE`, `API_KEY_TB`,
`WEBPAY_RETURN_URL`. (To test against Transbank's integration environment you would swap to
`Environment.Integration` with the integration commerce codes/keys — the SDK exports
`IntegrationApiKeys` / `IntegrationCommerceCodes` for that.)

## The purchase flow

```
Frontend                      ccemuc-api                    Transbank          DB
   │                              │                            │               │
   │ POST /purchases              │                            │               │
   │ {userId, coursesIds}         │                            │               │
   │─────────────────────────────►│ validatePurchase()         │               │
   │                              │  • ensureAllCoursesExist     │               │
   │                              │  • ensureAllCoursesHaveCapacity              │
   │                              │ createOrRetrievePurchase ──────────────────►│ (build/save Purchase,
   │                              │                            │               │  @BeforeCreate buyOrder)
   │                              │ createWebPayTransaction ──►│               │
   │                              │   create(buyOrder,         │               │
   │                              │    sessionId=userId,       │               │
   │                              │    totalAmount, returnUrl) │               │
   │ {purchase, webPayResponse}  │◄───────────────────────────│ {token, url}  │
   │◄─────────────────────────────│                            │               │
   │                              │                            │               │
   │ redirect user to webPayResponse.url?token_ws=...          │               │
   │ ───────────────────────────────────────────────────────►│ (user pays)   │
   │                              │                            │               │
   │ Transbank redirects to WEBPAY_RETURN_URL?purchaseId=...   │               │
   │ (carrying token_ws)          │                            │               │
   │                              │                            │               │
   │ POST /purchases/confirm/:id  │                            │               │
   │ {token_ws}                   │ confirmWebPayToken() ─────►│ commit(token) │
   │                              │◄───────────────────────────│ {status,...}  │
   │                              │ if AUTHORIZED:             │               │
   │                              │   changeIsPaidToTrue ───────────────────►  │ Purchase.isPaid=true
   │                              │   createEnrollments ────────────────────►  │ Enrollment rows +
   │                              │                            │               │ Course.capacity--
   │ {purchase, transactionStatus}│                            │               │
   │◄─────────────────────────────│                            │               │
```

### Step 1 — `POST /purchases` (`create`)

1. `validatePurchase` → `ensureAllCoursesExist` and `ensureAllCoursesHaveCapacity` (each
   course must exist and have `capacity > 0`).
2. `createOrRetrievePurchase` — reuses an existing unpaid `Purchase` with the same
   `(userId, coursesIds)` if present, otherwise builds + saves a new one. The
   `@BeforeCreate` hook stamps a unique `buyOrder`.
3. `handleWebPayTransaction` — if not already paid, calls `createWebPayTransaction`:
   - `totalAmount = Σ course.price` over `coursesIds`.
   - `returnUrl = ${WEBPAY_RETURN_URL}?purchaseId=${purchase.id}`.
   - `transaction.create(buyOrder, userId, totalAmount, returnUrl)`.
4. Responds `201 { purchase, webPayResponse }`. The frontend redirects the user to
   `webPayResponse.url` (with `token_ws`).

### Step 2 — `POST /purchases/confirm/:id` (`confirm`)

1. Requires `token_ws` in the body (else `400`).
2. Loads the purchase by `:id` (else `404`).
3. `confirmWebPayToken(token_ws)` → `transaction.commit(token_ws)`. On SDK error it returns
   `{ status: 'ERROR', error }` → responds `402`.
4. If `purchase.isPaid` already → returns `200` (idempotent).
5. If `transactionStatus.status === 'AUTHORIZED'`:
   - `changeIsPaidToTrue` sets `isPaid = true`.
   - `createEnrollments` runs (see below).
   - Responds `200 { purchase, transactionStatus }`.
6. Otherwise → `400 { error: 'Transacción no autorizada' }`.

### `createEnrollments` (post-authorization)

For the purchased `coursesIds` **plus all `core`-type courses**, for each course id:
- Skip if an enrollment already exists for `(userId, courseId)`.
- Otherwise create the `Enrollment` (with `purchaseId`) and decrement that course's
  `capacity` via `updateCourseCapacity`.

So every paying user is automatically enrolled in the mandatory `core` modules in addition to
what they bought.

### `GET /purchases/statusToken/:token` (`statusToken`)

Commits/inspects a token out-of-band and returns the Webpay `transactionStatus`. Used to
reconcile/inspect a transaction without the enrollment side effects of `confirm`.

## Email confirmation — `POST /purchases/sendConfirmation`

`sendConfirmation` validates the purchase exists, then `sendEmail` builds a **Nodemailer**
SMTP transport from env vars and sends the message:

```ts
nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: { user: process.env.EMAIL_ADMIN, pass: process.env.EMAIL_KEY },
});
// from: process.env.EMAIL_FROM, to: email, subject, html: text
```

Body: `{ purchaseId, email, subject, text }` where `text` is the HTML body. Requires
`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_ADMIN`, `EMAIL_KEY`, `EMAIL_FROM`.

## Notes & gotchas for maintainers

- **Production is hard-wired.** The SDK uses `Environment.Production`. Be careful running the
  purchase flow locally — it will hit the real gateway unless you switch to
  `Environment.Integration`.
- **No DB transaction wraps confirm.** `changeIsPaidToTrue`, enrollment creation, and
  capacity decrements are sequential awaits, not a single atomic transaction. A failure
  midway can leave partial enrollments. If you extend this flow, consider wrapping it in a
  Sequelize transaction.
- **Capacity is checked at create, decremented at confirm.** There's a window where capacity
  can be oversold under concurrency. Keep this in mind for high-demand modules.
- **Idempotency** is handled by the `isPaid` short-circuit in `confirm` and the
  existing-enrollment check in `createEnrollments`.
