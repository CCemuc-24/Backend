# CCemuc API — Documentation

This folder is the reference documentation for the **CCemuc backend** (`ccemuc-api`), the
REST API that powers course registration and payment for the CCemuc congress.

The platform lets students register, browse course modules, purchase electives/workshops
through **Transbank Webpay Plus**, and get automatically enrolled (plus a confirmation
email) once payment is authorized.

## Documentation index

| Document | What it covers |
|----------|----------------|
| [architecture.md](./architecture.md) | High-level architecture, layered design, request lifecycle |
| [tech-stack.md](./tech-stack.md) | Runtime, frameworks, libraries and why each is used |
| [project-structure.md](./project-structure.md) | Folder-by-folder map of the repository |
| [data-model.md](./data-model.md) | Entities, relationships, schema and migration history |
| [api-reference.md](./api-reference.md) | Every HTTP endpoint, auth requirements and payloads |
| [payments.md](./payments.md) | Webpay Plus purchase/confirmation flow and email confirmation |
| [setup-and-deployment.md](./setup-and-deployment.md) | Environment variables, Docker, nginx, local + prod run |
| [conventions.md](./conventions.md) | **Design conventions and the recipe for adding a new feature** |

> If you are about to add a feature, read [conventions.md](./conventions.md) — it is the
> canonical "how we build things here" guide and is mirrored in the root `CLAUDE.md`.

## TL;DR

- **Language / runtime:** TypeScript on Node.js, framework **Koa**.
- **Persistence:** PostgreSQL via **Sequelize** (`sequelize-typescript` decorators).
- **Domain:** `User`, `Course`, `Purchase`, `Enrollment` (4 entities).
- **Payments:** Transbank Webpay Plus (`transbank-sdk`), production environment.
- **Auth:** static bearer-token middleware (no user sessions/JWT).
- **Deploy:** Docker Compose + nginx reverse proxy, image on AWS ECR Public.
