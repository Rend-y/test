## Mini balance service

Simple NestJS + PostgreSQL service for user balance management with history-based recalculation.

## Requirements

- Node.js 18+
- PostgreSQL running locally (or adjust env variables)

## Environment

App uses `.env` file (via `@nestjs/config` + `joi` validation).

Example:

```bash
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=test
```

Rules:

- `DB_USER`, `DB_PASSWORD`, `DB_NAME` are required (validated on startup).
- `PORT`, `DB_HOST`, `DB_PORT` have sane defaults.

> Note: The database (`DB_NAME`) must already exist in PostgreSQL (`CREATE DATABASE test;`), TypeORM will create only tables, not the database itself.

## Install & run

```bash
npm install
npm run start:dev
```

Swagger UI:

- `http://localhost:3000/api`

## Database & migrations

The app uses TypeORM with entities:

- `users` (`id`, `balance`)
- `payment_history` (`id`, `userId`, `action`, `amount`, `ts`)

TypeORM is configured with:

- `synchronize: true` – auto-creates/updates tables from entities (good for dev).

> Recommendation: for production disable `synchronize` and rely only on migrations.

## API

All endpoints are under `/users`. See Swagger (`/api`) for interactive docs.

### Create user

`POST /users`

Body:

```json
{
  "balance": 0
}
```

- `balance` – optional, non-negative number; default is `0`.
- Returns created `User` with generated `id` and `balance` stored as string with 2 decimals.

### Get user

`GET /users/:id`

- Returns user with current balance or `404` if user not found.

### Credit (top-up balance)

`POST /users/credit`

Body:

```json
{
  "userId": 1,
  "amount": 100
}
```

### Debit (withdraw from balance)

`POST /users/debit`

Body:

```json
{
  "userId": 1,
  "amount": 100
}
```

Common validation for credit/debit:

- `userId` – integer, `>= 1`.
- `amount` – positive number.

Balance calculation logic (same for both operations):

- New record added to `payment_history` with:
  - `action = "credit"` for top-up.
  - `action = "debit"` for withdrawal.
- Current balance is recalculated as:
  - sum of `amount` with sign `+` for `credit`;
  - sum of `amount` with sign `-` for `debit`.
- For **debit**:
  - if resulting balance `< 0` – transaction is rolled back and request fails with `400 Insufficient funds`.

## Logging

The app uses:

- Global `LoggingInterceptor` – logs every HTTP request with method, URL and processing time.
- `UsersService` logger – logs user creation, credit/debit operations and important error cases (user not found, insufficient funds).

## Mini balance service

Simple NestJS + PostgreSQL service for user balance management with history-based recalculation.

### Requirements

- Node.js 18+
- PostgreSQL running locally (or change env variables)

### Environment

App uses `.env` file (via `@nestjs/config`), example:

```bash
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=test
```

You can override these values per environment.

### Install

```bash
npm install
```

### Run in dev

```bash
npm run start:dev
```

Swagger UI will be available at:

- `http://localhost:3000/api`

### Database schema

TypeORM `synchronize: true` will create tables:

- `users` (`id`, `balance`)
- `payment_history` (`id`, `userId`, `action`, `amount`, `ts`)

Make sure you have at least one user, for example:

```sql
INSERT INTO users (id, balance) VALUES (1, 0);
```

### API

#### Get user

`GET /users/1`

#### Debit user

`POST /users/debit`

```json
{
  "userId": 1,
  "amount": 100
}
```

Validation:

- `userId` – integer, `>= 1`
- `amount` – positive number

Logic:

- New record added to `payment_history` with `action = "debit"`, `amount`
- Balance is recalculated as
  - sum of `amount` with sign `+` for `credit`
  - sign `-` for `debit`
- If resulting balance \< 0 – request is rejected with `400 Insufficient funds`
