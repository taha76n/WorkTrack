# WorkTrack

> A company work management backend — built to learn SQL and PostgreSQL deeply, one query at a time.

WorkTrack is a learning project disguised as a real application. It's a simplified blend of company management, project tracking, employee records, and basic invoicing. The point isn't the product — it's the **database work underneath it**.

Every feature is built twice in spirit: first by understanding the raw SQL, then by wrapping it in an Express endpoint. No ORM, no query builder, no abstraction hiding what Postgres is actually doing.

---

## Why this exists

Most backend tutorials teach you an ORM before they teach you SQL. That inverts the learning. You end up knowing `prisma.employee.findMany({ where: { status: 'active' } })` without being able to explain what a JOIN is, why a `NOT IN` with a NULL returns zero rows, or why an index exists.

This project flips the order:

1. **Learn the SQL first** — write it in `psql`, run it, read the result, understand why it works.
2. **Then expose it** — wrap that query in a parameterized endpoint.
3. **Eventually, compare** — later, rebuild the same project with Prisma and understand exactly what SQL it generates.

The infrastructure stays deliberately boring. The complexity lives in the data relationships and the queries.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js | ESM |
| Language | TypeScript | strict mode |
| Dev runner | `tsx` | no build step during development |
| Web framework | Express | minimal, no magic |
| Database | PostgreSQL 16 | running in Docker |
| DB driver | `pg` | raw SQL, no ORM |
| Config | `dotenv` | single `.env` file |

**Explicitly not used:** Prisma, Sequelize, TypeORM, MongoDB, Redis, message queues, microservices, GraphQL, Kubernetes.

That's not a limitation — it's the curriculum.

---

## Getting started

### Prerequisites

- Node.js 20+
- Docker
- `psql` (or a Postgres GUI, but `psql` is what the project teaches)

### 1. Start PostgreSQL

```bash
docker run --name wm-postgres \
  -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=work_management \
  -p 5432:5432 \
  -v wm_pgdata:/var/lib/postgresql/data \
  -d postgres:16
```

The named volume `wm_pgdata` keeps your data across container restarts.

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Install and run

```bash
npm install
npx tsx watch src/server.ts
```

Server runs on `http://localhost:3000`.

### 4. Connect to the database

```bash
docker exec -it wm-postgres psql -U postgres -d work_management
```

Useful `psql` commands:

```
\dt              list tables
\d employees     describe a table
\x               toggle expanded output
\pset pager off  disable the pager
```

---

## Database schema

The schema grows as the project progresses. Current state:

```
companies
   ├── departments
   │      └── employees (self-referencing manager_id)
   └── customers
```

**`companies`** — `id`, `name`, `industry`, `created_at`
**`departments`** — `id`, `company_id → companies`, `name`, `created_at`
**`employees`** — `id`, `department_id → departments`, `manager_id → employees`, `first_name`, `last_name`, `email`, `salary`, `hire_date`, `status`, `created_at`
**`customers`** — `id`, `company_id → companies`, `name`, `email`, `phone`, `created_at`

Constraints in place:

- `employees.email` is `UNIQUE NOT NULL`
- `employees.salary` has `CHECK (salary > 0)`
- `employees.status` is restricted to `('active', 'on_leave', 'terminated')`
- Cascades: deleting a company cascades to its departments, employees, and customers
- Nullable self-reference: deleting a manager sets their reports' `manager_id` to `NULL`

---

## API

Base path: `/api/v1`

| Method | Path | Description |
|---|---|---|
| `GET` | `/companies` | List all companies |
| `GET` | `/companies/:id` | Fetch a company by ID |
| `GET` | `/employees` | List employees, optional `?status=` filter |
| `GET` | `/employees/:id` | Fetch an employee by ID |

### Example

```bash
curl "http://localhost:3000/api/v1/employees?status=active,on_leave"
```

All queries are parameterized. User input never touches the SQL string.

---

## Learning roadmap

Progress against the SQL curriculum this project is built around:

- [x] **Level 1** — Fundamentals: `CREATE TABLE`, constraints, `INSERT`/`UPDATE`/`DELETE`, foreign keys, cascades
- [ ] **Level 2** — Filtering: `IN`, `BETWEEN`, `LIKE`, `ORDER BY`, `LIMIT`, `OFFSET`, `DISTINCT`
- [ ] **Level 3** — Joins: `INNER`, `LEFT`, multi-table, self-joins
- [ ] **Level 4** — Aggregation: `GROUP BY`, `HAVING`, `COUNT`/`SUM`/`AVG`
- [ ] **Level 5** — Advanced filtering: `EXISTS`, correlated subqueries, `CASE`
- [ ] **Level 6** — Subqueries
- [ ] **Level 7** — CTEs
- [ ] **Level 8** — Dates and Postgres functions
- [ ] **Level 9** — `CASE`-based business logic
- [ ] **Level 10** — `INSERT`/`UPDATE`/`DELETE` with `RETURNING`
- [ ] **Level 11** — Transactions
- [ ] **Level 12** — Constraints and data integrity (deep dive)
- [ ] **Level 13** — Indexes and `EXPLAIN ANALYZE`
- [ ] **Level 14** — Pagination, search, dynamic query building
- [ ] **Level 15** — Reporting queries
- [ ] **Level 16** — Window functions

**Phase 2** (after raw SQL is complete): rebuild the same application with Prisma and compare every query against its hand-written SQL equivalent.

---

## Project structure

```
src/
├── controllers/     request handlers — SQL lives here for now
├── routes/          Express routers
├── db/
│   └── pool.ts      single pg Pool, shared across the process
├── app.ts           Express app, mounts routers
└── server.ts        entry point
```

The structure is intentionally flat. Architecture will be added when it earns its place, not before.

---

## Principles

A few rules this project follows, mostly to resist bad habits:

1. **User input never enters a SQL string.** Only `$1`, `$2`, ... placeholders do.
2. **The database is the last line of defence.** App-level validation is nice; `CHECK`, `NOT NULL`, and `FOREIGN KEY` are the ones that actually hold.
3. **Explicit columns in `SELECT`.** No `SELECT *` in the API layer — the response shape shouldn't change because someone added a column.
4. **Every DB call is `await`ed inside a `try/catch`.** Async operations that fail silently are the most expensive kind of bug.
5. **Prefer the DB doing the work.** If Postgres can classify, filter, or aggregate it cleanly, it doesn't belong in JavaScript.
