# Teleconsultation Platform — Project Context

Status: **design phase, in progress**. No application code exists in this repo yet — product/architecture planning is locked (v3), the site map is locked, and we are mid-way through the visual design pass (Step 1: theme selection, not yet signed off). Everything below is the full decision history; a new session should be able to pick up from this file alone without re-deriving anything. Keep it updated as decisions change.

## What this is

An ophthalmology-focused teleconsultation MVP, modeled loosely on [EyeGenie](https://eyegenie.in) (Kanpur-based doorstep eye-checkup + teleconsultation service) but re-scoped for a leaner, software-only MVP with its own differentiator. Must look professional/modern and must produce revenue — every feature decision below is filtered through that.

**Scope is ophthalmology only for the MVP.** No other specialties, no doorstep-technician/hardware model at launch (that's a Phase 2 upsell path, not the MVP).

## The USP

A self-administered **pre-diagnosis / self-test module** (visual acuity, color vision, Amsler grid, astigmatism, symptom + red-flag questionnaire) whose structured results are shown to the doctor during the video consult — plus a **"Test Your Vision for Free"** standalone module that doubles as top-of-funnel lead generation. Neither is diagnostic; both are explicitly screening aids, worded to avoid India's CDSCO medical-device classification.

## Revenue model

The paid video consultation is the only monetized event. Every other feature (search, instant-match, the free test) exists to funnel into that booking or to reduce friction around it. This framing has driven several specific decisions below (e.g. where the pre-diagnosis test sits in the flow).

## Patient booking — three entry paths, one convergence

- **Path A — Choose your doctor.** Search/filter → doctor profile → pick a slot. If that slot gets taken before checkout, offer next slot with the same doctor or reassignment — never a dead end.
- **Path B — See a doctor now.** Instant match to the soonest available doctor, weighted by availability, specialty match, rating, and load-balancing (not pure random — a bad weighting starves good doctors of one or the other pool).
- **Path C — Schedule for later.** Non-emergency; patient picks a convenient time first, system locks in the best-available doctor as the slot approaches.

All three converge at **Doctor + slot confirmed → Payment → Booking confirmed**.

### Pre-diagnosis placement (finalized)

The pre-diagnosis test sits **after payment, not before**. Placing it between "slot chosen" and "pay" would add friction exactly at the conversion moment. Instead: Payment → Booking confirmed → pre-visit check offered as an included bonus (not a gate), completable any time up to and including the video-call waiting room. If the patient already ran the free "Test Your Vision" tool within ~30 days, those results are reused rather than repeated. Showing the patient their own partial results before the call is deliberately used as a curiosity hook to pull them toward attending.

A **red-flag questionnaire** runs earlier (~30 seconds, shared across all three paths) purely for routing/urgency — sudden vision loss or trauma reroutes to a priority slot instead of the normal queue.

## Doctor rejection & reassignment

A doctor can decline a booked patient but must state a reason (logged for accountability). The slot releases immediately. Then:
- If the patient hand-picked that doctor (Path A) → WhatsApp sends an interactive choice ("choose another doctor" / "auto-assign me") with a **20-minute timeout defaulting to auto-assign** — a paid booking never sits unresolved.
- If the doctor was system-assigned (Path B/C) → reassign immediately, just notify; no need to ask the patient to decide something they never chose.
- No doctor available at all in the window → escalate to admin ops for manual reschedule/refund.

**Communication channel: WhatsApp Business API** (primary, specifically for tappable quick-reply button templates), SMS as fallback.

## Video consult

**Google Meet for the MVP** — a unique link per appointment via the Calendar API, sent to both sides. Fast and near-zero cost, but it can't be embedded (Google blocks iframing), so there's no in-call side panel, weaker access control, and no integrated call analytics. Decision: ship with Meet now, but keep the video provider behind an internal interface in the booking service so migrating to embedded WebRTC (Twilio Video / 100ms / Agora) in Phase 2 — once the in-call pre-diagnosis panel and call analytics matter — is a provider swap, not a rewrite.

## Analytics (finalized scope: full v1, not staged)

**Buy** PostHog for behavioral/product analytics — funnels, cohorts, and specifically **feature-flag-based A/B testing** (used to validate the pre-diagnosis placement decision above against a control, on real traffic). **Build** revenue/operational analytics in-house on Postgres — this is the source of financial truth and must not depend on a third-party's sampling.

All four dashboard panels ship in v1 together:
1. Funnel & conversion (per path A/B/C, and free-test-origin vs. direct)
2. Revenue (GMV, revenue by path/specialty/doctor, refunds, **repeat-booking LTV given top billing** — this business runs on repeat visits, not first bookings)
3. Operational health & doctor reliability (rejection rate/reasons, reassignment time, no-shows, red-flag SLA, payment failure rate — rejection rate crossing a threshold triggers the admin alert directly, event-driven, not dashboard-watched)
4. Placement experiment (the PostHog A/B test above)

A **shared event taxonomy** (defined once, e.g. `free_test_started`, `booking_initiated{path}`, `payment_completed`, `doctor_rejected{reason}`, `consult_completed`, `pre_diagnosis_variant_assigned`) feeds both PostHog and Postgres so the two never quietly disagree about what a "completed booking" is.

## Architecture (target, not yet built)

- **Frontend**: single Next.js + TypeScript app, role-based route groups for patient / doctor / admin (not separate deployables at MVP scale). *(Next.js is recommended and pending final confirmation — see "Design phase" below; the alternative on the table is Vite+React for a lighter pure-UI build, but Next.js's SSR/SSG matters for the free-test funnel's SEO.)*
- **Backend**: one deployable, modularized by function — Auth, Doctor directory & search, **Booking & matching engine** (paths A/B/C + reassignment logic), **Pre-diagnosis & red-flag rules** (versioned/auditable, deliberately kept deterministic rather than ML at MVP), Prescriptions, Payments, Notifications, **Revenue & ops analytics**.
- **Data**: PostgreSQL (core + financial truth), Redis (slot-locking with short TTL — critical since paths A/B/C can race for the same doctor's slot; a lock failure triggers the fallback-to-alternate-doctor flow automatically), S3-compatible object storage (doctor credential docs, scan images).
- **External integrations**: Google Meet + Calendar API (video), WhatsApp Business API (notifications/decisions, SMS fallback), a payment gateway (Razorpay/UPI), PostHog (behavioral analytics + A/B flags).

## Compliance notes (India-specific, don't skip)

- Every doctor must be verified against their **NMC registration number** (Telemedicine Practice Guidelines 2020) before onboarding.
- **DPDP Act 2023** consent required at signup and at self-test data collection.
- The self-test/pre-diagnosis module must stay worded as a screening aid, never a diagnosis, to avoid CDSCO medical-device software classification.

## Site map

One app, three role-based route groups. Full detail (a tree diagram + page-by-page tables) lives in the "EyeCare Site Map" artifact linked below — summary here:

- **Patient site & app**: Home, Test Your Vision (Free), Find a Doctor (Path A), See a Doctor Now (Path B), Schedule a Visit (Path C), How It Works, Pricing & Trust, About/FAQ, Join as a Doctor, My Account, Legal & Privacy. The free test + three path pages are the direct booking-conversion pages.
- **Doctor portal**: Dashboard & Queue, Appointment & Consult Room, Availability & Slots, Prescriptions, Earnings & Ratings, Profile & Verification.
- **Admin console**: Doctor Management, Appointment Operations, Revenue & Funnel Dashboard, Operational Health & Reliability, Content & Promotions, Compliance Tracker.

### Homepage anatomy (the page carrying the "nudge toward booking" mandate)

In scroll order: sticky nav (persistent Book Appointment button) → hero (3 ranked CTAs: Test Your Vision Free / Book Appointment / See a Doctor Now, + trust strip) → How It Works → Why ophthalmology-only (doctor credential cards) → free-test reprised (mid-page, differently worded) → outcomes/testimonials → transparent pricing block → doctor recruitment strip → FAQ snippet → footer. Four deliberate nudge points at different scroll depths (nav button, hero, free-test reprise, pricing block) so a visitor who skips one doesn't skip all of them.

## Reference material

- **Architecture & flows** — patient booking flow, doctor rejection/reassignment state flow, system architecture, analytics event taxonomy: Artifact "EyeCare Platform Blueprint" — https://claude.ai/code/artifact/6d230ed2-a0f0-482d-ae45-a15ed1695b9a
- **Site map** — full tree + homepage anatomy + per-role page inventories: Artifact "EyeCare Site Map" — https://claude.ai/code/artifact/6179e0d7-4a10-4751-aab1-8d9913d923fe
- Both artifacts are owned by the user — update them in place, don't recreate, when decisions change.
- EyeGenie reference points (from public search results, not a direct fetch — network policy blocks eyegenie.in from this environment): doorstep technician + AI-screened eye exam, real-time ophthalmologist supervision, frame selection + medicine delivery, Kanpur-based, founded 2023.

## Design phase — where we actually are

Product/architecture planning and the site map are locked. We are now inside the visual design pass, working **top-down with sign-off required at each level** before going deeper:

1. **Theme** (palette, type, spacing, motion) → land as design tokens — **in progress, awaiting sign-off, see below**
2. Global layout shell (nav, footer, containers, breakpoints, shared primitives)
3. Page list
4. Sections per page
5. Components (built against the design system, with mock/static data)

Then assemble sections → pages → site. **Backend and functionality come after the UI is approved** — this phase is UI-only, mock data throughout.

**Stack decision**: React + Tailwind + shadcn/ui + Framer Motion for animation. Next.js is recommended over Vite (SEO matters for the free-test funnel landing page) but **not yet explicitly confirmed by the user** — confirm before scaffolding.

### Tooling status (check freshness before relying on any of this)

- **Figma MCP**: connected, read-only (View seat on the "eye teleconsultation" Figma team — sufficient for `get_design_context`/`get_screenshot`/`get_metadata` as a layout reference, not for writing designs into Figma). One file exists: `figma.com/design/TUA1XfCAm73DqVzwjavJXM` — confirmed empty (no frames) as of this writing.
- **Lovable**: was used to prototype the Home page in a separate sandbox (project id `01d91b6b-0489-4ade-a47c-7ad35be86968`, workspace `O76qwvjQBZZe1xnwGxJT`). Got partway through a full redesign (dark near-black teal+amber theme, Inter Tight/Inter/JetBrains Mono, framer-motion reveal/stagger helpers committed) before **the workspace ran out of credits mid-build**. **Decision: abandoned as the build target** — we now build directly in this repo instead. The Lovable exploration is kept only as design inspiration (see theme Option A below), not as code to port.
- **21st.dev Magic MCP** (`mcp__magic__*`): not connected in this session despite being expected — searched, not found. Proceeding without it.
- **`ui-ux-pro-max` skill/plugin**: does not exist anywhere in this account's plugin/skill catalog (searched via `SearchPlugins`/`SearchSkills` — zero matches), and no matching files exist anywhere on this session's filesystem. If the user has this locally on their own machine, it will **not** be visible to a cloud/remote session unless committed into this repo (e.g. under `.claude/skills/`) and pushed. A real, catalog-available substitute was offered instead: the **"design" plugin** (`design:design-system`, `design:design-critique`, `design:accessibility-review`, `design:ux-copy`) — not confirmed installed as of this writing.
- **`figma:figma-design-to-code` skill**: also not present in this session (Figma's own real skills are `figma:figma-use`, `figma:figma-generate-design`, etc. — no `figma-design-to-code` among them). Figma is being used read-only anyway (no skill needed for `get_design_context`/`get_screenshot`), so this is non-blocking.

### Theme — 3 options proposed, awaiting user sign-off

**Option A — "Clinical Dark"**: near-black teal-tinted background, deep teal primary + warm amber accent, gradient-mesh glow orbs, Inter Tight (display) / Inter (body) / JetBrains Mono (labels). Scroll-reveal + stagger + hover-glow + count-up stats + glass-blur nav. High-tech/specialist vibe, closest to Linear/Vercel's dark marketing sites. (This is the direction the Lovable attempt was mid-way through building.)

**Option B — "Bright Confident"**: same motion/interaction system, inverted to a warm light surface — same deep teal primary, coral/warm-orange secondary accent, soft colored shadows instead of glow. Bold geometric-sans display / Inter body / JetBrains Mono labels. Warmer, more approachable, likely reads as more immediately trustworthy across a broader (including older, less tech-fluent) patient demographic than a dark UI.

**Option C — "Editorial Teal"**: hybrid — one dramatic dark gradient hero band (Framer-style drama) then the rest of the page in bright, high-legibility light for the trust-heavy sections (doctor credentials, pricing, FAQ). Uses **Fraunces** (display serif, continuity with the original Blueprint/Site Map artifacts' typography) / Inter body / IBM Plex Mono labels — trades some of the "exact Linear look" for a more distinctive, less-templated identity.

**Open tension flagged to the user, not yet resolved**: A and B commit fully to the geometric-sans, no-serif look the named reference sites (Linear/Vercel/Stripe) actually use; C intentionally deviates with a serif for distinctiveness. Waiting on the user's call on which matters more, plus final theme pick (or a blend), before landing tokens and moving to Step 2 (global layout shell).

## Next action for a new session

1. Confirm whether the user has since picked a theme option (or blend) and confirmed Next.js vs. an alternative — if not asked yet, ask before proceeding.
2. Once theme is signed off: land it as actual design tokens (Tailwind config / CSS variables), then move to Step 2 (global layout shell) — still no backend, still mock data, still sign-off at each step before going deeper.
3. Do not re-attempt Lovable as a build target unless the user explicitly asks (workspace was out of credits as of this writing — check if resolved before assuming otherwise).
