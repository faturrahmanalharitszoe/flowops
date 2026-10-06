# OpsFlow

OpsFlow is a workforce operations platform. This repository is a monorepo containing the
web frontend and the API backend, along with the local infrastructure needed to run them.

## Tech stack

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| Frontend         | React + Vite + TypeScript                    |
| Backend          | Node.js + Express + TypeScript               |
| Database         | PostgreSQL (via Docker)                      |
| ORM              | Prisma (v7, driver adapter `@prisma/adapter-pg`) |
| Package manager  | npm workspaces                               |
| Lint / format    | ESLint (flat config) + Prettier              |

See [`docs/architecture/ADR-001-initial-technology-stack.md`](docs/architecture/ADR-001-initial-technology-stack.md)
for the reasoning behind these choices.

## Repository structure

```
opsflow/
├── apps/
│   ├── api/            # Express + Prisma API
│   │   ├── prisma/     # Prisma schema and migrations
│   │   └── src/        # API source code
│   └── web/            # React + Vite web app
├── packages/           # Shared packages (reserved for future use)
├── docs/
│   └── architecture/   # Architecture Decision Records
├── docker-compose.yml  # Local PostgreSQL
└── package.json        # Root workspace scripts
```

## Prerequisites

- **Node.js** `>= 20.19.0` (check with `node --version`)
- **npm** `>= 10`
- **Docker Desktop** (or Docker Engine + Compose v2) running locally

## Getting started (from a fresh clone)

> All commands below are run from the repository root unless stated otherwise.

1. **Install dependencies** (installs every workspace at once):

   ```bash
   npm install
   ```

2. **Create the environment files** by copying the examples:

   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   On Windows PowerShell use `Copy-Item .env.example .env`, etc.

   The `.env` files are git-ignored. Never commit real secrets.

3. **Start PostgreSQL** in Docker:

   ```bash
   npm run docker:up
   ```

   Wait a few seconds for the health check to pass. You can confirm with
   `docker compose ps`.

4. **Generate the Prisma client**:

   ```bash
   npm run db:generate
   ```

5. **Start the apps** (API and web together):

   ```bash
   npm run dev
   ```

6. **Verify everything works**:

   - Web app: <http://localhost:5173> — the page should report `API health: online`.
   - API health: <http://localhost:4000/health> — should return HTTP `200` with
     `{ "status": "ok", "database": "up", ... }`.

## Available root scripts

| Script                  | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Run API and web in watch mode (together)               |
| `npm run dev:api`       | Run only the API                                       |
| `npm run dev:web`       | Run only the web app                                   |
| `npm run build`         | Build API and web for production                       |
| `npm run typecheck`     | Type-check all workspaces                              |
| `npm run lint`          | Run ESLint over the whole repo                         |
| `npm run lint:fix`      | Run ESLint and apply safe fixes                        |
| `npm run format`        | Format the repo with Prettier                          |
| `npm run format:check`  | Check formatting without writing                       |
| `npm run db:generate`   | Generate the Prisma client                             |
| `npm run db:migrate`    | Create/apply a migration in development                |
| `npm run db:reset`      | Drop and re-create the database, then re-run migrations |
| `npm run db:studio`     | Open Prisma Studio                                     |
| `npm run docker:up`     | Start PostgreSQL in the background                     |
| `npm run docker:down`   | Stop the containers                                    |
| `npm run docker:logs`   | Follow container logs                                  |

## Environment variables

### Root `.env` (used by `docker-compose.yml`)

| Variable            | Default    | Description            |
| ------------------- | ---------- | ---------------------- |
| `POSTGRES_USER`     | `opsflow`  | Database user          |
| `POSTGRES_PASSWORD` | `opsflow`  | Database password      |
| `POSTGRES_DB`       | `opsflow`  | Database name          |
| `POSTGRES_PORT`     | `5432`     | Host port for Postgres |

### `apps/api/.env`

| Variable       | Default                                                          | Description                     |
| -------------- | ---------------------------------------------------------------- | ------------------------------- |
| `NODE_ENV`     | `development`                                                     | Runtime environment             |
| `PORT`         | `4000`                                                            | API HTTP port                   |
| `DATABASE_URL` | `postgresql://opsflow:opsflow@localhost:5432/opsflow?schema=public` | Prisma connection string        |
| `CORS_ORIGIN`  | `http://localhost:5173`                                           | Comma-separated allowed origins |

### `apps/web/.env`

| Variable            | Default                  | Description          |
| ------------------- | ------------------------ | -------------------- |
| `VITE_API_BASE_URL` | `http://localhost:4000`  | Base URL of the API  |

> Keep `POSTGRES_*` in the root `.env` consistent with `DATABASE_URL` in
> `apps/api/.env`. If you change the database port or credentials in one place,
> update the other.

## Database workflow

Prisma ORM v7 is used with the new `prisma-client` generator and the
`@prisma/adapter-pg` driver adapter. The generated client is written to
`apps/api/src/generated/prisma` and is git-ignored.

- Add models to `apps/api/prisma/schema.prisma`.
- Run `npm run db:migrate` to create and apply a migration.
- The client is regenerated automatically before `dev`, `build`, and `typecheck`,
  or manually via `npm run db:generate`.

## Troubleshooting

- **Port already in use**: change `PORT` in `apps/api/.env`, the Vite `server.port`
  in `apps/web/vite.config.ts`, or `POSTGRES_PORT` in the root `.env`.
- **`docker` command not found / daemon not running**: install and start Docker
  Desktop, then wait until the engine is ready (`docker info`).
- **API reports `"database": "down"`**: make sure the container is running
  (`docker compose ps`) and that `DATABASE_URL` matches the root `.env` values.
- **Prisma logs `28P01` (password authentication failed)** even though the
  container is healthy: another PostgreSQL is already listening on port `5432`
  (for example a native `postgresql-x64-*` Windows service). `localhost:5432`
  then reaches that server instead of the container. Either stop that service,
  or move the container to another host port: set `POSTGRES_PORT=5433` in the
  root `.env`, change the port in `DATABASE_URL` in `apps/api/.env` to match,
  then run `npm run docker:down && npm run docker:up`.
- **Prisma errors after pulling changes**: run `npm install` then
  `npm run db:generate`.
