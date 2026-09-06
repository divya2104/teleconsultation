# ClearSight — Sections per Page (Step 4)

For each route: the ordered list of sections and what each one communicates or
does. Components to build these are Step 5. References: [PAGES.md](./PAGES.md),
[LAYOUT-SHELL.md](./LAYOUT-SHELL.md), spec §4–§10.

Conventions: **CTA** = call-to-action button. Every list/table section has a
defined empty state. "mock" = static data module in `src/lib/mock/` for the UI
phase.

---

# 1. Marketing

## 1.1 Home `/`

1. **Hero** — headline "eye care that starts before the call", subcopy, primary CTA *Book a consult* + secondary *See how it works*, regulation micro-line. Right: the pre-consult triage summary card (the product moment — shows what the doctor receives). *(built)*
2. **How it works — 4 steps** — self-test → AI pre-screening → video consult → e-prescription + recall. Icon + number + one line each. *(built)*
3. **The USP, expanded** — "screening aid, not a diagnosis" statement; three tiles: calibrated acuity check, symptom triage, photo red-flag screen. Reassurance that the doctor makes every call.
4. **Secondary USP — personalized recall** — diabetic-retinopathy risk flag → "come back by [date]" vs generic annual nudge. One stat on the at-risk population. *(built, condensed)*
5. **Trust strip** — registered ophthalmologists, Telemedicine Guidelines 2020, DPDP-aligned data handling, encrypted. Logos/【badges】as available.
6. **Pricing teaser** — single per-consult price, "no subscription", link to `/pricing`.
7. **FAQ** — 5–6 items (Is this a diagnosis? What if it's an emergency? Do I need any device? How do I get my prescription? Refunds?). Accordion.
8. **Doctor recruitment band** — "Are you an ophthalmologist?" + *Practise with us* CTA. *(built)*
9. *(Footer from shell — includes the not-for-emergencies line.)*

## 1.2 How it works `/how-it-works`

1. **Page intro** — one paragraph framing the journey; anchor nav to the steps.
2. **Step 1 — Guided intake** (`#intake`) — the questionnaire, the calibrated on-screen acuity test (how distance calibration works, per-eye), the 2–3 guided photos, the DPDP consent moment. Screenshot/illustration per part.
3. **Step 2 — AI pre-screening & triage** — rule-based urgency scoring, red-flag keyword → emergency banner, photo heuristic screen. Explicit: never shown to the patient as a diagnosis; inconclusive results are flagged, never block booking.
4. **Step 3 — The video consult** — doctor opens with the triage summary; managed video; audio-only fallback / reschedule if it fails.
5. **Step 4 — E-prescription & recall** (`#recall`) — structured prescription, PDF, WhatsApp delivery; risk-score-driven recall date.
6. **Safety & regulation** — Telemedicine Practice Guidelines 2020, registered-doctors-only, documentation, data privacy.
7. **CTA band** — *Book a consult*.

## 1.3 For doctors `/for-doctors`

1. **Hero** — "consult on your schedule, with triage summaries that shorten every call", *Apply to practise* CTA (→ `/login?intent=practice`).
2. **Why ClearSight** — 3–4 value tiles: pre-triaged consults, flexible availability, pay-per-consult (no lock-in), structured prescriptions.
3. **How onboarding works** (`#onboarding`) — numbered: apply with medical registration number → credential review → verification → go live. Timeline feel.
4. **Requirements** — registration/licence, specialty, valid ID, device/bandwidth basics.
5. **Earnings** (`#earnings`) — per-consult payout model, payout cadence, example math. "Stub for MVP" — no live dashboard yet.
6. **FAQ** (`#faq`) — liability, AI's role (assistive only), no-show handling, data access.
7. **Apply CTA band**.

## 1.4 Pricing `/pricing`

1. **Header** — "Pay per consultation. No subscription."
2. **Price card** — single card: amount, what's included (guided intake + AI pre-screening, video consult with a registered ophthalmologist, structured e-prescription, personalized recall reminder). *Book a consult* CTA. UPI/Razorpay note.
3. **What's not included / good to know** — follow-ups are separate consults; medicines and eyewear not sold here.
4. **Refund & no-show policy** — payment failure holds the slot briefly then releases; no-show / cancellation windows; how refunds are processed.
5. **FAQ** — subset focused on money and cancellations.

## 1.5 About `/about`

1. **Mission** — short statement; the problem (access to eye care in India) and the approach (capital-light, screening-first).
2. **Clinical governance** — who oversees clinical quality; AI is assistive only.
3. **Regulation & privacy** — Telemedicine Guidelines 2020 alignment; DPDP: explicit consent, data minimization, deletion on request.
4. **Contact** — support email / channel; grievance officer line (compliance).

## 1.6 Legal `/legal/[doc]`

1. **Doc header** — title, last-updated date.
2. **Table of contents** — jump links (sticky on desktop).
3. **Body** — prose sections (`prose` container). Docs: `privacy`, `terms`, `telemedicine-consent`, `refund-policy`.

## 1.7 Not found `/404` + error

1. **Message** — plain "page not found", link home. Keeps the not-for-emergencies line.

---

# 2. Auth

## 2.1 Login / Sign up `/login`

1. **Brand + purpose line** — "Log in or create your account".
2. **Identifier step** — phone or email field, *Send code*. Consent/terms micro-copy with links.
3. **OTP step** — 6-digit input, resend timer, *Verify*. Back to edit identifier.
4. **First-time profile step** *(new patients only)* — name, optional diabetes status, notification preference. *Continue*.
5. **Redirect** — by role (patient → `/dashboard`, doctor → `/doctor/dashboard`, admin → `/admin`).
6. **Doctor-apply branch** *(`?intent=practice`, unverified)* — application form: name, medical registration number, specialty, credential upload → **"Application pending verification"** confirmation screen.

---

# 3. Patient

## 3.1 Dashboard `/dashboard` (tabbed)

**Header** — "Your dashboard", *Book a consult* CTA. Tabs: Overview · Appointments · Prescriptions · Recalls (`?tab=`).

- **Overview tab**
  1. **Next appointment card** — doctor, date/time, countdown; *Join* when live; *Reschedule / Cancel*. Empty → "No upcoming consult" + *Book*.
  2. **Pending intake nudge** — only if a booked consult has incomplete intake: *Complete your self-test* → `/intake/questionnaire`.
  3. **Next recall** — reason + due date + *Book follow-up*. Hidden if none.
  4. **Recent prescription** — most recent, *View PDF*.
- **Appointments tab** — list (upcoming + past), each row: doctor, date, status pill, triage badge, → `/appointments/[id]`. Filter: upcoming / past. Empty state.
- **Prescriptions tab** — list, each: date, doctor, diagnosis summary, *View / Download PDF*. Empty state.
- **Recalls tab** — list of recall reminders: reason (e.g. diabetic-retinopathy risk), due date, status (upcoming / due / done), *Book follow-up*. Empty state.

## 3.2 Book a consult `/book` (FocusShell, StepProgress: Reason · Doctor & slot · Review · Pay)

1. **Step — Reason for visit** — symptom picker / short free text; "Is this an emergency?" quick check. If no recent `TriageRecord` → note that a 5-min self-test comes next.
2. **Intake handoff** — routes into `/intake/questionnaire` when intake is required, returns here after `review`.
3. **Step — Doctor & slot** — doctor list (name, specialty, next slots, languages) + slot grid for the chosen doctor. Emergency flag from intake shown as a banner but does not block.
4. **Step — Review** — doctor, slot, price, triage summary preview (patient-safe), consent checkbox.
5. **Step — Pay** — Razorpay handoff; slot-held timer; on failure → "slot released" + retry; on success → confirmation.
6. **Confirmation** — booking ref, what happens next, calendar add, "prescription arrives on WhatsApp".

## 3.3 Guided intake `/intake/[step]` (FocusShell, StepProgress: Questionnaire · Vision check · Photos · Review)

- **questionnaire**
  1. **Symptom questions** — one-question-per-screen or short grouped form; rule-based urgency scored as you go.
  2. **Emergency interstitial** — red-flag keyword (e.g. sudden vision loss) → full EmergencyBanner + "seek in-person care now"; *Continue anyway* keeps the flag.
- **acuity**
  1. **Calibration** — set viewing distance (card-on-screen or known-object method), pick eye to test first.
  2. **Chart test** — decreasing optotypes, per eye, response capture; result as logMAR/Snellen.
  3. **Result summary** — per-eye result, "this is a screening measure".
- **photos**
  1. **Consent** — explicit DPDP consent for photo + health data collection (checkbox, plain language).
  2. **Capture guide** — 2–3 shots with on-screen framing overlay (straight-on, each eye); retake control.
  3. **Review thumbnails** — confirm or retake.
- **review**
  1. **Summary** — questionnaire answers, acuity result, photo thumbnails, computed urgency.
  2. **Submit** — creates `TriageRecord`; inconclusive AI is marked "flagged for doctor", never blocks. → back to `/book`.

## 3.4 Video consult room `/consult/[id]` (FocusShell, content width)

1. **Pre-call device check** — camera/mic preview, permission prompts, network check, *Join*.
2. **Waiting state** — "waiting for Dr X"; tips; ability to leave.
3. **Live call** — video area, self-view, controls (mute, camera, leave), connection indicator.
4. **Degraded state** — audio-only fallback banner; *Reschedule* if it drops.
5. **Post-call** — "consult complete", "your prescription will arrive on WhatsApp", link to `/appointments/[id]`, recall note.

## 3.5 Appointment detail `/appointments/[id]`

1. **Header** — doctor, date/time, status pill; actions: *Join* (if live), *Reschedule*, *Cancel* (policy-gated).
2. **Triage summary (patient-safe)** — acuity, symptoms given, "screening only" note. No raw AI flags.
3. **Prescription** — diagnosis, medications, notes, *Download PDF*. Empty until the consult completes.
4. **Recall** — resulting recall date + reason, *Book follow-up*.
5. **History note** — link back to appointments list.

## 3.6 Profile & consent `/profile`

1. **Personal details** — name, phone, email (verify to change).
2. **Health context** — self-reported diabetes status (feeds recall risk).
3. **Notification preferences** — WhatsApp / SMS / email toggles.
4. **Consent records** — what was consented to and when (photo/health data), withdraw option.
5. **Data controls** — export request; **Delete my account & data** (DPDP) with confirm dialog explaining consequences.

---

# 4. Doctor

## 4.1 Dashboard `/doctor/dashboard`

1. **Today strip** — tiles: consults today, completed, no-shows, next in N min.
2. **Today's queue** — rows ordered by slot: time, patient (initials/age), **TriageBadge**, one-line summary, *Join* when live, → patient/consult. Urgent rows pinned/highlighted.
3. **Needs attention** — inconclusive-AI or urgent-flag consults that want a look before the call.
4. **Empty state** — "no consults scheduled today" + link to availability.

## 4.2 Consult queue `/doctor/queue` (wide container)

1. **Filters** — upcoming / past-due / completed; date range; search patient.
2. **Queue table** — time, patient, triage badge, urgency, status, payment state, actions. Row expand → triage snapshot.
3. **Bulk/empty states**.

## 4.3 Availability `/doctor/availability`

1. **Weekly template** — per-day slot windows editor (add/remove ranges), slot length, timezone.
2. **Date overrides** — block specific dates / add one-off availability.
3. **Preview** — resulting bookable slots for the next 2 weeks.
4. **Save bar** — sticky, shows unsaved changes.

## 4.4 Consult room `/doctor/consult/[id]` (FocusShell, content/full width)

1. **Call area** — video + self-view + controls; connection state; audio-only fallback.
2. **Triage panel** (side) — tabs or stacked: questionnaire answers, acuity result, photos with red-flag annotations ("screening aid"), **past appointments** for this patient.
3. **E-prescription form** — structured: diagnosis, medications (repeatable rows), advice/notes; validation (RHF+zod). *Generate prescription* → PDF + delivery + triggers `RecallSchedule`.
4. **Wrap-up** — confirmation that prescription sent + recall date set; *End consult*.

## 4.5 Patient history `/doctor/patients/[id]`

1. **Patient header** — initials, age, diabetes/risk flags, last seen.
2. **Appointments timeline** — past consults with diagnosis + link to each.
3. **Prescriptions** — list with PDFs.
4. **Triage records** — prior acuity trend, prior photos.

## 4.6 Doctor profile `/doctor/profile`

1. **Verification status** — badge (verified / pending / action needed) + registration number on file.
2. **Professional details** — specialty, languages, display bio (shown to patients at booking).
3. **Payout details** — bank/UPI (stub for MVP), payout history placeholder.
4. **Account** — notification prefs, sign out.

---

# 5. Admin `/admin` (tabbed, wide container)

**Header** — "Admin console". Tabs: Doctors · Bookings · Payments · Analytics.

- **Doctors tab**
  1. **Verification queue** — pending applications: name, registration number, submitted date, *Review* → Sheet with credentials, *Approve / Reject* (reason).
  2. **Directory** — all doctors, status, active toggle, → detail.
- **Bookings tab**
  1. **Filters** — status, doctor, date range.
  2. **Table** — booking ref, patient, doctor, slot, status, payment state, triage badge → *Review* Sheet.
- **Payments tab**
  1. **Transactions table** — ref, gateway ref, amount, status, date.
  2. **Refund action** — per row, confirm dialog, reason (no-show / cancellation / other), policy reminder.
- **Analytics tab**
  1. **KPI tiles** — bookings, revenue, no-show rate, consult-completion rate, recall→rebooking conversion (spec §12).
  2. **Trend charts** — bookings over time, revenue over time (simple line/area), no-shows.
  3. **Date-range control**.

---

# 6. Shared patterns

| Pattern | Sections / behaviour |
|---------|----------------------|
| **EmergencyBanner** | Full-width `--triage-urgent`, `role="alert"`, static under reduced motion. Appears top of content in intake questionnaire and `/book` when urgency scoring hits a red flag. Copy names the symptom category; booking continues, flagged. |
| **Notifications dropdown** | AppShell topbar bell → recent items (booking confirmed, prescription ready, recall due), "mark all read", empty state "you're all caught up". No standalone page for MVP. |
| **Empty states** | Every list/table/tab: icon + title + one-line hint + optional CTA (via `EmptyState`). |
| **Loading** | `Skeleton` rows for tables/lists; the video room and payment steps get explicit spinners with status text. |
| **Slot-held timer** | `/book` pay step: visible countdown; on expiry the slot releases and the step shows a retry state. |

---

# 7. Build order for Step 5

1. Marketing: Home is done → How it works, For doctors, Pricing, About, Legal.
2. Patient: Dashboard tabs (real cards + mock), Appointment detail, Profile.
3. Intake flow (questionnaire → acuity → photos → review) + EmergencyBanner wiring.
4. Booking flow + slot-held timer.
5. Doctor: Dashboard queue, Queue table, Availability, Consult room (triage panel + Rx form), Patient history, Profile.
6. Admin console (4 tabs) + charts.
7. Consult room (patient + doctor video shells) — mock/static call UI.
8. Shared: notifications dropdown, skeletons, toasts.
