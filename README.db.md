# Database setup (Drizzle + Supabase)

## Prerequisites

- `DATABASE_URL` must be set in `.env.local`.
- `SUPABASE_SERVICE_ROLE_KEY` must be set for seeding.
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is set for the seed script.

## Install dependencies

```bash
cd /var/www/crickbites/cb-backend
npm install
```

## Generate and apply migrations

```bash
npm run db:generate
npm run db:migrate
```

## Seed the admin user

```bash
npm run db:seed
```

## Notes

- For dev-only sync without migrations, use `npm run db:push`.
- Migrations are created under `cb-backend/drizzle`.

