# ADR-001: Initial Technology Stack

## Status
Accepted

## Context
OpsFlow requires authentifikasi, employee management, site management.

## Decision
We will use ...

Frontend: react + vite + typescript
Backend: nodejs + express
Database: postgresql
...

## Why
...
Karena frontendnya membutuhkan yang gampang dibuat responsive.

Untuk backend menggunakan nodejs karena using Node.js allows the team to use TypeScript across frontend and backend, reducing context switching and allowing shared knowledge/types where appropriate. Express was selected because the application's API requirements are relatively straightforward and the team already has production experience with it.

Employee
    ↓
Assignment
    ↓
Site
    ↓
Attendance

Supervisor
    ↓
Site

Employee
    ↓
Attendance History

Untuk database menggunakan postgresql karena Datanya sangat relational dan membutuhkan constraints serta transactional consistency. ita punya latitude/longitude + radius. PostgreSQL memberi opsi menggunakan PostGIS kalau suatu saat kebutuhan geospatial menjadi lebih kompleks.

Repo strategy:
Monorepo agar bisa share types untuk typescript dan memisahkan deploy di CI/CD.

Language: Typescript

Database access: Prisma provides type-safe database access that integrates well with TypeScript, while its schema and migration tooling make the relational data model easier to understand and maintain. Raw SQL remains available when complex or performance-sensitive queries require greater control.

package manager : npm karena lebih luas dipakai

Local infrastructure : Docker, lebih terpisah dan reproducible environtment.

## Alternatives Considered
### Repository
Separate frontend/backend repositories
- Better isolation between applications.
- Rejected because the current small team benefits more from
  shared tooling and TypeScript types in a monorepo.

### Database Access
Raw SQL using node-postgres
- Provides maximum SQL control.
- Rejected for primary data access because Prisma provides
  better TypeScript integration and migration tooling.

Drizzle ORM
- Provides a SQL-like and type-safe abstraction.
- Considered viable, but Prisma was selected because of its
  mature ecosystem and developer experience.

### Database
MySQL
- Capable of handling the MVP workload.
- PostgreSQL selected for the relational model and potential
  future geospatial requirements.

## Consequences

Positive:
- Frontend and backend use TypeScript.
- Monorepo simplifies shared tooling and types.
- Prisma provides type-safe database access and migrations.
- Docker provides reproducible local environments.
- PostgreSQL supports the relational requirements of OpsFlow.
- Frontend and backend can still be deployed independently.

Negative:
- Monorepo requires CI/CD configuration to detect which
  application needs to be built/deployed.
- Developers need familiarity with Docker.
- Prisma introduces an abstraction layer over SQL.
- Complex queries may still require raw SQL and PostgreSQL knowledge.
- TypeScript adds a compilation/type-checking step.