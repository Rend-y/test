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

