# Deploying ClearSight (private testers demo)

Target: **Vercel** (Next.js SSR app) + **Supabase Cloud** (Postgres/Auth/Storage)
+ **Resend** (custom SMTP for email OTP). All free tiers.

Phone OTP is **disabled** in this deploy (`NEXT_PUBLIC_PHONE_OTP_ENABLED` unset /
`false`) — real SMS needs Twilio/MSG91 + Indian DLT registration.

---

## 1. Supabase Cloud

1. Create a project at https://supabase.com/dashboard — **region: ap-south-1
   (Mumbai)**. Note the **DB password**.
2. **Project Settings → API** → copy `Project URL`, `anon` key, `service_role` key.
3. **Account → Access Tokens** → create one (for the CLI).

Apply schema + storage (from repo root):

```bash
export SUPABASE_ACCESS_TOKEN=<token>
npx supabase link --project-ref <ref>      # prompts for DB password
npx supabase db push                        # both migrations → cloud
```

`db push` creates all tables, RLS, the `open_slots` / `book_appointment` /
`submit_triage` RPCs, the `handle_new_user` trigger, **and** the `intake-photos`
storage bucket + policies (all in `supabase/migrations/20260908000001_core.sql`).
Do **not** run `supabase config push` — `config.toml` has local-only SMS values.

Seed demo data: Supabase **SQL Editor** → paste all of `supabase/seed.sql` → Run.
(6 doctors + availability + `doctor@clearsight.test` / `admin@clearsight.test`.)
Verify: `select count(*) from doctors;` → 6.

Auth config (Dashboard → **Authentication**):

- **Providers → Email**: enabled; **Confirm email: OFF**. Phone provider: OFF.
- **Email Templates → Magic Link**: replace body with
  `supabase/templates/magic_link.html` (renders the 6-digit `{{ .Token }}`).
- **URL Configuration**: set **Site URL** and add to **Redirect URLs** the
  Vercel URL (after step 3).

---

## 2. Resend (email OTP delivery)

Supabase's built-in SMTP is ~2–4 emails/hour project-wide — too low even for a
small test.

1. https://resend.com → sign up → add + verify a sending domain (DNS records).
   No domain? Skip Resend and accept Supabase's limit for a tiny closed test.
2. Create an **API key**.
3. Supabase → **Authentication → Emails → SMTP Settings → Enable custom SMTP**:
   - Host `smtp.resend.com` · Port `465` · User `resend` · Pass = API key
   - Sender `no-reply@<domain>` · Name `ClearSight`
4. Send a test from the SMTP panel; confirm it arrives.

---

## 3. Vercel

1. https://vercel.com → sign in with GitHub → **Add New → Project** → import
   `divya2104/teleconsultation`. Framework preset **Next.js** (auto).
2. **Environment Variables** (Production + Preview):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (**no** `NEXT_PUBLIC_`) |
   | `NEXT_PUBLIC_PHONE_OTP_ENABLED` | `false` |

3. **Deploy** → note `https://<project>.vercel.app`.
4. Put that URL into Supabase **Site URL + Redirect URLs** (step 1).
5. Vercel → **Redeploy** once so the build has all four env vars.

---

## 4. Verify (against the live URL)

- [ ] Log in with a real email → code arrives (check spam first time) → `/dashboard`.
- [ ] Typing a 10-digit number shows "Phone sign-in isn't available yet"; button disabled.
- [ ] `/book` → Dr. Anand Rao + open slot → confirm → success page → shows on `/dashboard`.
- [ ] Self-test questionnaire → acuity → photos (upload 1–2) → review → submit.
      Supabase: a `triage_records` row with `urgency`; objects under
      `intake-photos/<appointment_id>/`.
- [ ] Log in as `doctor@clearsight.test` → `/doctor/queue` shows the booking →
      open consult → triage + acuity + signed photo URLs render.
- [ ] Log in as `admin@clearsight.test` → `/admin` loads.
- [ ] Second patient account can't see the first's appointment (RLS).
- [ ] Vercel build log clean; no runtime errors on first requests.

---

## Notes

- **Free Supabase projects pause after ~7 days idle.** Un-pause in the dashboard,
  or add a scheduled ping.
- Updating the app: push to `main` → Vercel auto-redeploys. Schema changes:
  `npx supabase db push` against the linked project.
- Still simulated in this deploy: payments (bookings auto-`paid`), video call,
  notifications; mock data for admin / prescriptions / recalls.
- Custom domain: add in Vercel → Project → Domains, then update Supabase Site URL.
