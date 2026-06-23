# Tech Stack & Dependencies

## Runtime & language

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 16 (alpine in Docker) | `node:16-alpine` base image |
| TypeScript | ^5.4.3 | Compiled to CommonJS, target ES2018 |
| ts-node | ^10.9.2 | Runs `.ts` directly in dev and for `sequelize-cli` |

TypeScript config ([`ccemuc-api/tsconfig.json`](../ccemuc-api/tsconfig.json)):
`strict: true`, `experimentalDecorators` + `emitDecoratorMetadata` (required by
`sequelize-typescript`), `rootDir: ccemuc-api/src`, `outDir: ./dist`.

## Core dependencies (`ccemuc-api/package.json`)

| Package | Purpose |
|---------|---------|
| `koa` | HTTP web framework (the application core) |
| `@koa/router` | Routing |
| `koa-bodyparser` | Parse JSON/form request bodies into `ctx.request.body` |
| `@koa/cors` | CORS — open to all origins so the frontend can call the API |
| `sequelize` + `sequelize-typescript` | ORM with decorator-based models |
| `pg`, `pg-hstore` | PostgreSQL driver |
| `transbank-sdk` | Transbank **Webpay Plus** payment integration |
| `nodemailer` | Sending confirmation emails over SMTP |
| `uuid` | Generate UUID v4 primary keys |
| `nanoid` | Small URL-friendly ID generator (available; used sparingly) |

## Dev / tooling dependencies

| Package | Purpose |
|---------|---------|
| `nodemon` | Watch + restart in dev (`npm run dev`) |
| `sequelize-cli` | Run migrations and seeders |
| `eslint` + `@typescript-eslint/*` | Linting (flat config in `eslint.config.mjs`) |
| `@types/*` | Type definitions for koa, node, nodemailer, uuid, etc. |

## npm scripts

| Script | Command | Use |
|--------|---------|-----|
| `dev` | `nodemon --watch src -e ts,json --exec ts-node src/index.ts` | Local development with hot reload |
| `build` | `tsc` | Compile to `dist/` |
| `start` | `node dist/index.js` | Run the compiled build |
| `lint` | `eslint .` | Lint |
| `lint:fix` | `eslint . --fix` | Lint + autofix |
| `test` | *(not configured)* | **No test framework is set up yet** |

> **Note:** there is currently no automated test suite. The `test` script is a placeholder
> that exits with an error.

## Infrastructure

| Tool | Role |
|------|------|
| Docker / Docker Compose | Local + deploy orchestration (`docker-compose.yml`, `docker-compose.pull.yml`) |
| PostgreSQL 13 | Database (`postgres:13` image) |
| nginx | Reverse proxy in front of the API (`nginx/api.conf`) |
| AWS ECR Public | Hosts the published image `public.ecr.aws/g3j2f9k6/ccemuc-api` |

## External services

- **Transbank Webpay Plus** — Chilean card-payment gateway. Configured for the
  **Production** environment (`Environment.Production`). Requires a commerce code and API key.
- **SMTP provider** — used by Nodemailer for confirmation emails (host/port/credentials via
  env vars).

See [setup-and-deployment.md](./setup-and-deployment.md) for the full environment-variable list.
