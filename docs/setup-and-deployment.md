# Setup & Deployment

## Environment variables

Environment files live in `env/` (the whole `env/` directory is git-ignored). Two files are
expected:

### `env/ccemuc-api.env` — API + integrations

| Variable | Purpose |
|----------|---------|
| `DB_HOST` | Postgres host (in compose: the service name `db-ccemuc`) |
| `DB_NAME` | Database name (must match `POSTGRES_DB`) |
| `DB_USER` | DB user (must match `POSTGRES_USER`) |
| `DB_PASS` | DB password (must match `POSTGRES_PASSWORD`) |
| `DB_PORT` | DB port (default `5432`) |
| `PORT` | API listen port (default `3000`) |
| `COMMERCE_CODE` | Transbank Webpay commerce code |
| `API_KEY_TB` | Transbank Webpay API key |
| `WEBPAY_RETURN_URL` | URL Transbank redirects to after payment (purchaseId appended as query) |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_ADMIN` | SMTP auth user |
| `EMAIL_USER` | SMTP user (declared; see note) |
| `EMAIL_KEY` | SMTP password |
| `EMAIL_FROM` | "From" address on confirmation emails |
| `AUTH_TOKEN` | Shared secret for `authMiddleware` (POST routes) |
| `DELETE_AUTH_TOKEN` | Shared secret for `deleteAuthMiddleware` (DELETE routes) |

> `EMAIL_FROM` is read by the mailer (`sendEmail`) — make sure it is present even though the
> README's sample list doesn't mention it. `NODE_ENV` is supplied by Docker Compose
> (`development`), not the env file, and selects the `databaseConfig` block in
> `config/database.ts`.

### `env/db-ccemuc.env` — Postgres container

| Variable | Purpose |
|----------|---------|
| `POSTGRES_USER` | DB user — must equal `DB_USER` |
| `POSTGRES_PASSWORD` | DB password — must equal `DB_PASS` |
| `POSTGRES_DB` | DB name — must equal `DB_NAME` |
| `POSTGRES_PORT` | DB port — must equal `DB_PORT` |

## Running locally (Docker Compose — recommended)

```bash
# from the repo root, with env/ files in place
docker-compose up --build
```

This uses [`docker-compose.yml`](../docker-compose.yml):
- `db-ccemuc` — `postgres:13`, volume `pgdata_ccemuc`, port `5432`.
- `ccemuc-api` — built from `ccemuc-api/docker/Dockerfile.dev`, port `3000`, `NODE_ENV=development`.

The API container entrypoint is [`start.sh`](../ccemuc-api/start.sh), which on boot runs:

```sh
npx sequelize-cli db:migrate      # apply migrations
npx sequelize-cli db:seed:all     # seed course catalog
npm run dev                       # start nodemon + ts-node
```

The API is then available at `http://localhost:3000`.

## Running the API directly (without Docker)

```bash
cd ccemuc-api
npm install
# export the env vars (or use a tool that loads env/ccemuc-api.env)
npm run dev          # hot-reload dev server (ts-node + nodemon)
# or
npm run build && npm start   # compiled build from dist/
```

You'll need a reachable PostgreSQL and the env vars set. Run migrations/seeds manually with
`npx sequelize-cli db:migrate` and `npx sequelize-cli db:seed:all`.

## Sequelize CLI

The CLI is wired via [`.sequelizerc`](../ccemuc-api/.sequelizerc) →
[`sequelize-cli-config.js`](../ccemuc-api/sequelize-cli-config.js), which registers `ts-node`
and exports `databaseConfig`. Common commands (run inside `ccemuc-api/`):

```bash
npx sequelize-cli db:migrate                       # run pending migrations
npx sequelize-cli db:migrate:undo                  # roll back last migration
npx sequelize-cli db:seed:all                       # run seeders
npx sequelize-cli migration:generate --name <name>  # scaffold a migration
```

## Production deployment

[`docker-compose.pull.yml`](../docker-compose.pull.yml) is the production variant: instead of
building from source it **pulls a prebuilt image** from AWS ECR Public
(`public.ecr.aws/g3j2f9k6/ccemuc-api:latest`) and runs it alongside Postgres.

```bash
docker-compose -f docker-compose.pull.yml up -d
```

[`nginx/api.conf`](../nginx/api.conf) is the reverse proxy: it listens on port `80` for
`api.ccemuc.cl` and proxies to the API on `localhost:3000`, forwarding `Host` /
`X-Forwarded-For` and supporting WebSocket upgrade headers.

`ccemuc-access.pem` (git-ignored) is the SSH key used to reach the host.

## Data export / reporting (out of band)

[`exports/process_data.py`](../exports/process_data.py) is a standalone Python (pandas +
openpyxl) script — **not part of the running API**. It reads `Users.csv`, `Courses.csv`,
`Enrollments.csv`, `Purchases.csv` exported from the DB and produces a formatted
`CCemuc_Datos_2024.xlsx` workbook (summary, users, courses, detailed sales, sales-by-course).
Run with `python3 exports/process_data.py` from the repo root (requires `pandas`, `openpyxl`).
