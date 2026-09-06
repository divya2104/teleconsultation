# Teleconsultation Platform — Project Context

Status: **planning locked, visual design not yet started**. No application code exists in this repo yet — product/architecture planning is locked (v3) and the site map is locked. A prior visual-design pass (theme exploration) was discarded and is being redone from scratch — nothing about theme/tooling should be assumed from before. Everything below is the decision history to build from; keep it updated as decisions change.

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

- **Frontend**: single Next.js + TypeScript app, role-based route groups for patient / doctor / admin (not separate deployables at MVP scale). Stack/framework choice to be reconfirmed when the visual design pass restarts.
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

## Visual design — to be (re)done

The visual design pass (theme, layout shell, page/section/component build-out) has not been started. A prior attempt was discarded at the user's request — do not assume any previous theme, palette, typography, or tooling choice; start fresh. General approach to follow once this restarts: work top-down (theme → global layout shell → page list → sections per page → components), get explicit sign-off before going deeper at each level, build UI-only with mock/static data, and bring in backend/functionality only after the UI is approved.
