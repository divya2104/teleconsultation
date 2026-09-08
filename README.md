# ClearSight — teleconsultation

Next.js 16 (App Router) + Supabase. Server-rendered app (no static export).

## Local development

Needs **Docker** (for the local Supabase stack) and Node 20+.

```bash
npm install
npm run db:start          # boots local Postgres, Auth, Storage, Studio, Inbucket
npm run db:reset          # applies supabase/migrations + supabase/seed.sql
npm run db:types          # regenerate src/lib/database.types.ts from the live schema
```

`npm run db:start` prints the local URL + anon key. Put them in `.env.local`
(see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from db:start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from db:start>
```

Then:

```bash
npm run dev
```

### Signing in (email OTP)

`/login` sends a 6-digit code by email. Locally it lands in **Inbucket** at
http://127.0.0.1:54324 — open the message and copy the code.

Seeded accounts (`supabase/seed.sql`):

| Email                   | Role   |
| ----------------------- | ------ |
| `doctor@clearsight.test`| doctor |
| `admin@clearsight.test` | admin  |

Any other email signs up as a **patient**.

## Deploy

- **Supabase**: create a cloud project, then
  `npx supabase link --project-ref <ref>` and `npx supabase db push` to apply
  migrations. Set the same three env vars in the host.
- **App**: any Node host for Next.js (Vercel is the natural fit). Set the env
  vars; no build-time secrets.

## What's backed by the database vs. still mock

Real (Supabase): auth, doctors + availability, booking (slot-locked),
guided-intake / triage (server-computed urgency), patient + doctor dashboards,
appointment detail, profile.

Still mock (`src/lib/mock/*`, marked `TODO(mock)`): payments (stubbed — bookings
mark `paid`), video call (simulated `CallStage`), notifications
(`consoleNotifier`), e-prescriptions, recalls + reminder jobs, admin
(onboarding / bookings / payments / analytics), doctor patients list.
Integration seams live in `src/lib/integrations/`.
