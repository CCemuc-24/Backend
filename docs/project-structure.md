# Project Structure

## Repository root

```
CCemuc/
├── ccemuc-api/              # The backend application (all source lives here)
├── env/                     # Environment files (git-ignored: /env is in .gitignore)
│   ├── ccemuc-api.env       # API + integrations config
│   └── db-ccemuc.env        # Postgres container config
├── exports/                 # Data exports + reporting script (not part of the running API)
│   ├── *.csv                # DB exports (Users, Courses, Enrollments, Purchases)
│   ├── CCemuc_Datos_2024.xlsx
│   └── process_data.py      # Python script: CSV → formatted Excel report
├── nginx/
│   └── api.conf             # Reverse-proxy config (proxies :80 → :3000)
├── docker-compose.yml       # Local dev: builds API image from source
├── docker-compose.pull.yml  # Deploy: pulls prebuilt image from ECR
├── ccemuc-access.pem        # SSH key (git-ignored: *.pem)
├── README.md                # Quick-start (Spanish)
└── docs/                    # ← you are here
```

## `ccemuc-api/` (the application)

```
ccemuc-api/
├── docker/
│   └── Dockerfile.dev       # node:16-alpine image; ENTRYPOINT ./start.sh
├── src/
│   ├── index.ts             # App bootstrap: Koa + middleware + DB auth + listen
│   ├── routes.ts            # Root router; mounts the 4 resource routers
│   │
│   ├── config/
│   │   └── database.ts      # Env-driven Sequelize config (by NODE_ENV)
│   │
│   ├── models/              # sequelize-typescript entity definitions
│   │   ├── index.ts         # Builds the Sequelize instance, registers models
│   │   ├── user.model.ts
│   │   ├── course.model.ts
│   │   ├── purchase.model.ts
│   │   └── enrollment.model.ts
│   │
│   ├── interfaces/          # *Attributes TS types for request bodies
│   │   ├── user.interfaces.ts
│   │   ├── course.interfaces.ts
│   │   ├── purchase.interface.ts
│   │   └── enrollment.interfaces.ts
│   │
│   ├── controllers/         # One class per entity
│   │   ├── user.controller.ts
│   │   ├── course.controller.ts
│   │   ├── purchase.controller.ts   # largest: payments + emails + enrollment
│   │   └── enrollment.controller.ts
│   │
│   ├── routes/              # One router per entity
│   │   ├── user.routes.ts
│   │   ├── course.routes.ts
│   │   ├── purchase.routes.ts
│   │   └── enrollment.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts        # Bearer token == AUTH_TOKEN
│   │   └── delete.auth.middleware.ts # Bearer token == DELETE_AUTH_TOKEN
│   │
│   ├── enums/
│   │   └── course-type.enum.ts       # core | elective | workshop
│   │
│   ├── utils/
│   │   └── rutValidator.ts           # Chilean RUT validation + fake-RUT generator
│   │
│   ├── migrations/          # Timestamped sequelize-cli migrations (schema history)
│   └── seeders/             # Initial data (course catalog)
│
├── .sequelizerc            # Points sequelize-cli at config/models/seeders/migrations
├── sequelize-cli-config.js # Loads ts-node + databaseConfig for the CLI
├── start.sh                # migrate → seed → npm run dev (container entrypoint)
├── nodemon.json            # Dev watcher config
├── eslint.config.mjs       # Flat ESLint config
├── tsconfig.json
└── package.json
```

## The per-entity convention

Every domain entity is represented by **one file in each of five folders**, all named after
the entity. This is the single most important structural convention in the codebase:

| Entity | Model | Interface | Controller | Router |
|--------|-------|-----------|------------|--------|
| User | `models/user.model.ts` | `interfaces/user.interfaces.ts` | `controllers/user.controller.ts` | `routes/user.routes.ts` |
| Course | `models/course.model.ts` | `interfaces/course.interfaces.ts` | `controllers/course.controller.ts` | `routes/course.routes.ts` |
| Purchase | `models/purchase.model.ts` | `interfaces/purchase.interface.ts` | `controllers/purchase.controller.ts` | `routes/purchase.routes.ts` |
| Enrollment | `models/enrollment.model.ts` | `interfaces/enrollment.interfaces.ts` | `controllers/enrollment.controller.ts` | `routes/enrollment.routes.ts` |

The router is then mounted in `src/routes.ts`, and the model registered in
`src/models/index.ts`. Adding a new entity means repeating this five-file pattern — see
[conventions.md](./conventions.md).

> File-naming note: most interface files are plural (`*.interfaces.ts`) but
> `purchase.interface.ts` is singular. Prefer `*.interfaces.ts` for new entities; the
> inconsistency is historical.
