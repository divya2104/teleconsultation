# Eye-Care Teleconsultation MVP — Design Spec

Date: 2026-09-05
Status: Draft, pending user review

## 1. Goal

Build an MVP teleconsultation platform for ophthalmology, competing with
Eyegenie (eyegenie.in) but differentiated by an AI-assisted pre-screening
flow that needs no proprietary hardware. Must look professional/modern and
ship fast as a services-only MVP (no home-visit logistics in v1).

## 2. Competitive reference: Eyegenie

Eyegenie's model: a technician visits the patient's home with US-FDA-approved
diagnostic hardware; an ophthalmologist supervises the exam live; "AI" is
tied to that hardware; prescription is sent over WhatsApp; medicines and
eyeglass frames are delivered. Subscription plans exist alongside one-off
visits. This requires device procurement, technician hiring/training, and
city-by-city logistics — not compatible with a fast, capital-light MVP.

## 3. USP

**Headline: AI-powered smartphone pre-screening & triage.** Before the video
call, the patient completes a guided self-test on their own phone: a
distance-calibrated visual acuity check, a symptom questionnaire, and 2–3
eye photos screened for visible red flags (redness, cloudiness, lid
abnormality). The doctor opens the consult with a ready-made triage summary
instead of starting cold. This is explicitly a **screening aid, not a
diagnosis** — the doctor makes every clinical call. No hardware is required,
so no other Indian eye-teleconsult app currently offers this without also
requiring a home visit.

**Secondary: diabetic-retinopathy risk flag + personalized recall.** After
each consult, a simple risk score (from diagnosis + patient-reported
diabetes status) drives a personalized "come back by [date]" reminder,
instead of a generic annual nudge. Cheap to build, creates repeat-visit
stickiness even on a pay-per-consult model, and targets a huge at-risk
population in India.

## 4. MVP scope

**In scope:**
- Patient: browse marketing site, book a consult, complete guided intake
  (questionnaire + visual acuity check + eye photos), pay per consult,
  join video consult, receive e-prescription, get recall reminder.
- Doctor: login, manage availability/slots, view upcoming-consult queue
  with pre-triage summaries, join video call, write structured
  e-prescription, view a patient's past appointment history.
- Admin: onboard/verify doctors, view bookings/payments, process refunds,
  basic analytics (bookings, revenue, no-shows).
- AI pre-screening (rule-based urgency scoring + heuristic/lightweight-model
  photo red-flag detection), diabetic-risk flag, recall scheduling.
- Payments via Razorpay (pay-per-consultation only).
- Notifications via WhatsApp Business API with SMS/email fallback.
- Responsive web app only (works on mobile browsers and desktop).

**Explicitly out of scope for MVP (roadmap for later):**
- Home-visit / technician / hardware hybrid model (Eyegenie-equivalent).
- Subscription plans (design allows adding later; MVP is pay-per-visit only).
- Native iOS/Android apps.
- Medicine and eyeglass-frame delivery/marketplace.
- Vernacular/voice-first intake (regional language support).
- Multi-specialty expansion.

## 5. Actors & user flows

- **Patient**: marketing site → book consult → guided intake → AI
  pre-screening runs → pick doctor/slot → pay → video consult (doctor has
  triage summary) → e-prescription delivered → recall reminder later.
- **Doctor**: dashboard → availability management → consult queue with
  triage summaries → video call → write e-prescription → patient history.
- **Admin**: doctor onboarding/verification → bookings/payments overview →
  refunds → analytics.

## 6. Architecture & components

- **Frontend**: one React (Next.js) app with role-based views for
  patient/doctor/admin — avoids maintaining two separate frontends.
- **Backend API**: handles auth, booking, triage, payments, prescriptions,
  recall scheduling. Language/framework: Node.js/TypeScript (matches
  frontend, single language across the stack for a small team).
- **Video**: a managed WebRTC provider (Daily.co or Twilio Video) rather
  than building signaling/TURN infrastructure — the single biggest
  infra-effort trap for a small MVP team.
- **Database**: Postgres for relational data (users, bookings,
  prescriptions, payments); S3-compatible object storage for eye photos and
  prescription PDFs.
- **Payments**: Razorpay (India-first, UPI support).
- **Notifications**: WhatsApp Business API, SMS/email fallback.
- **Auth**: phone/email OTP — no password management to build.
- **Hosting**: any mainstream cloud (Azure, given prior familiarity in
  other projects, is a reasonable default) — not a hard constraint.

## 7. Data model (key entities)

- `User` (role: patient | doctor | admin)
- `DoctorProfile` (registration number, specialty, verification status)
- `Availability` (doctor_id, slot windows)
- `Appointment` (patient_id, doctor_id, slot, status, payment_status)
- `TriageRecord` (appointment_id, questionnaire answers, acuity result,
  photo references, computed urgency level, AI screening flags)
- `Prescription` (appointment_id, diagnosis, medication, notes, PDF ref)
- `RecallSchedule` (patient_id, risk_score, due_date, reminder_sent)
- `Payment` (appointment_id, amount, gateway_ref, status)

## 8. Data flow

Intake form → `TriageRecord` created (urgency/risk computed) → attached to
`Appointment` → doctor dashboard joins `Appointment` + `TriageRecord` +
patient's past appointments → video session → `Prescription` created →
`RecallSchedule` computed from diagnosis + risk score → background job
sends reminder ahead of the due date.

## 9. AI pre-screening detail

- **Visual acuity**: deterministic, calibrated on-screen eye chart
  algorithm (standard optometry approach) — not AI, and the part patients
  will trust most.
- **Photo red-flag screening**: heuristic/lightweight vision-model check
  for gross anomalies (redness, cloudiness, lid abnormality) via an
  existing vision API. Always labeled as a screening aid; never surfaced to
  the patient as a diagnosis.
- **Symptom questionnaire**: rule-based urgency scoring. Red-flag keywords
  (e.g. sudden vision loss) trigger an immediate "seek emergency care"
  banner and bypass normal queue routing.
- **Diabetic-risk flag**: simple score from diagnosis + patient-reported
  diabetes status, feeding `RecallSchedule`.

## 10. Non-functional requirements

- **Regulatory**: must follow India's Telemedicine Practice Guidelines
  (2020) — registered doctors only, proper consultation documentation, AI
  is assistive only and never presented as a diagnosis.
- **Privacy**: patient health data encrypted at rest and in transit; basic
  DPDP Act alignment (explicit consent for photo/health data collection,
  data minimization, ability to delete account data).
- **Performance/reliability**: video-call failure falls back to audio-only
  or triggers a reschedule flow; inconclusive AI screening is flagged for
  the doctor but never blocks booking; payment failure holds the slot
  briefly then releases it; no-shows trigger the refund/reschedule policy.

## 11. Testing strategy

- Unit tests on the two pieces of real business logic: triage/urgency
  rules and recall-date computation.
- Integration test covering booking → payment → appointment creation.
- Manual/exploratory pass on the live video flow.

## 12. Success metrics for MVP

- Consult completion rate (booked → completed, not cancelled/no-show).
- Doctor time-per-consult (triage summary should shorten this vs. cold-start).
- Recall reminder → rebooking conversion rate.

## 13. Roadmap (post-MVP)

1. Subscription plans layered on top of pay-per-visit.
2. Home-visit/technician + hardware hybrid (Eyegenie-equivalent), once
   there's traction and funding to justify the logistics.
3. Native mobile apps.
4. Medicine/eyewear delivery marketplace.
5. Vernacular/voice-first intake for regional-language users.
