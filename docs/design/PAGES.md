# ClearSight — Page List (Step 3)

Every page in the MVP, grouped by area, with its route, shell, and job. Derived
from the design spec §4–§6 and the route structure in
[LAYOUT-SHELL.md](./LAYOUT-SHELL.md) §2. Sections per page come in Step 4.

Shell key: **M** = MarketingShell · **A** = AppShell · **F** = FocusShell · **B** = bare.

Count: 7 marketing · 1 auth (+ doctor-apply branch) · 6 patient · 6 doctor · 1 admin · 2 shared patterns = **21 routes**.

> **Route discipline:** a list only becomes its own route when it needs a
> deep-linkable URL or grows past a screenful. Patient prescriptions/recalls and
> all four admin views ship as **tabs**, not routes. Promote later if they earn it.

---

## 1. Marketing (public, SSR)

| # | Page | Route | Shell | Job |
|---|------|-------|-------|-----|
| 1 | **Home** | `/` | M | The pitch. Lead with the USP — AI smartphone pre-screening, no hardware. 3-step how-it-works, credibility/regulation proof, diabetic-retinopathy recall as secondary USP, pricing teaser, doctor-recruitment CTA, FAQ. Primary CTA: **Book consult**. |
| 2 | **How it works** | `/how-it-works` | M | Full patient journey: guided intake (acuity + questionnaire + photos) → triage summary → video consult → e-prescription → recall. Hammers "screening aid, not a diagnosis" and "registered ophthalmologists only". |
| 3 | **For doctors** | `/for-doctors` | M | Recruitment landing. Value: triage summaries shorten consults, flexible slots, pay-per-consult payout. Onboarding steps, verification requirements (medical registration number), FAQ. CTA: **Apply to practice** → `/login` apply branch. |
| 4 | **Pricing** | `/pricing` | M | Pay-per-consultation only (no subscription in MVP). One price card, what's included (triage, video, e-prescription, recall reminder), refund / no-show policy, UPI / Razorpay note. |
| 5 | **About** | `/about` | M | Mission, clinical governance, Telemedicine Practice Guidelines 2020 stance, DPDP privacy summary, contact. |
| 6 | **Legal doc** | `/legal/[doc]` | M | Templated long-form pages: `privacy`, `terms`, `telemedicine-consent`, `refund-policy`. Prose container, TOC, last-updated. |
| 7 | **Not found / error** | `/404`, `/error` | M | Branded, links home, keeps the "not for medical emergencies" line. |

---

## 2. Auth

| # | Page | Route | Shell | Job |
|---|------|-------|-------|-----|
| 8 | **Login / Sign up** | `/login` | F | One flow, no passwords. Enter phone or email → enter OTP → (first time) minimal profile → redirect by role. New patients auto-create. |
| 8b | *Doctor apply branch* | `/login?intent=practice` | F | If the identifier isn't a verified doctor and they came from "For doctors": application form (name, registration number, specialty, credential upload) → **"Application pending verification"** screen. |

---

## 3. Patient

| # | Page | Route | Shell | Job |
|---|------|-------|-------|-----|
| 9  | **Dashboard** | `/dashboard` | A | Tabbed hub. **Overview** tab: next-appointment card (Join when live), pending-intake nudge, next recall, **Book a consult** CTA, first-time empty state. **Appointments** tab: past + upcoming list. **Prescriptions** tab: e-prescriptions, view / download PDF. **Recalls** tab: personalized "come back by [date]" reminders with reason (e.g. diabetic-retinopathy risk) + **Book follow-up**. Tabs are `?tab=` query state, not routes. |
| 10 | **Book a consult** | `/book` | F | Reason for visit → (no recent intake? route to intake first) → pick doctor + slot → review → pay (Razorpay) → confirmation. Slot held during payment; failure releases it; emergency flag from intake shown but doesn't block. |
| 11 | **Guided intake** | `/intake/[step]` | F | The USP. Steps: `questionnaire` (rule-based urgency; red-flag keyword → emergency banner, booking continues flagged) · `acuity` (calibrated on-screen chart, per eye, deterministic) · `photos` (2–3 eye photos with framing guide + DPDP consent) · `review` (confirm → creates TriageRecord). Inconclusive AI = flag for doctor, never blocks. |
| 12 | **Video consult room** | `/consult/[id]` | F | Patient side. Device check → waiting → live call (managed WebRTC) → audio-only fallback / reschedule on failure. Post-call note: prescription arrives on WhatsApp. |
| 13 | **Appointment detail** | `/appointments/[id]` | A | Deep-linkable drill-in from the Appointments tab: status, doctor, patient-safe triage summary, prescription (view / download PDF), reschedule / cancel per policy. |
| 14 | **Profile & consent** | `/profile` | A | Contact details, self-reported diabetes status, notification preferences (WhatsApp / SMS / email), consent records, **delete my data** (DPDP). |

---

## 4. Doctor

| # | Page | Route | Shell | Job |
|---|------|-------|-------|-----|
| 15 | **Dashboard** | `/doctor/dashboard` | A | Today's queue ordered by slot: each row = triage badge (normal / review / urgent) + one-line summary + Join when live. Tiles: today's count, no-shows. |
| 16 | **Consult queue** | `/doctor/queue` | A | Fuller list + filters (upcoming / past-due / completed), triage summaries, patient snapshot on hover / expand. |
| 17 | **Availability** | `/doctor/availability` | A | Weekly recurring slot windows, block specific dates, timezone. Produces bookable slots. |
| 18 | **Consult room** | `/doctor/consult/[id]` | F | Doctor side. Video + **triage panel** (questionnaire answers, acuity, photos w/ red-flag notes, past appointments) + structured **e-prescription form** (diagnosis, medication, notes) → PDF + delivery + recall computation. |
| 19 | **Patient history** | `/doctor/patients/[id]` | A | That patient's past appointments, prescriptions, triage records, diabetes / risk flags. |
| 20 | **Doctor profile** | `/doctor/profile` | A | Registration number, specialty, verification status, display bio, payout details (stub for MVP). |

---

## 5. Admin

| # | Page | Route | Shell | Job |
|---|------|-------|-------|-----|
| 21 | **Admin console** | `/admin` | A | One tabbed page (`?tab=`). **Doctors**: directory + verification queue; open an application in a Sheet → review registration number / credentials → approve / reject; toggle active status. **Bookings**: all appointments, filters (status / doctor / date), drill into one in a Sheet — payment + triage state. **Payments**: transactions, gateway refs, statuses; **Process refund** with confirm dialog. **Analytics**: KPI tiles + simple charts for spec §12 metrics (bookings, revenue, no-show rate, consult-completion rate, recall → rebooking conversion). |

---

## 6. Shared patterns (designed once, not routes)

| Pattern | Where it appears | Job |
|---------|------------------|-----|
| **Emergency interstitial** | intake questionnaire, booking | Red-flag urgency → full-width `--triage-urgent` banner: "Sudden vision loss / severe pain — seek in-person emergency eye care now." Booking still allowed, flagged for the doctor. |
| **Notifications dropdown** | AppShell topbar (all roles) | Bell → recent in-app items (booking confirmed, prescription ready, recall due). Full WhatsApp / SMS / email delivery is out-of-app. Not a standalone page for MVP. |

---

## 7. Explicitly NOT pages in the MVP

Per spec §4 "out of scope": subscription plans / billing portal, home-visit or
technician scheduling, medicine / eyewear marketplace, native app landing,
vernacular language switcher, multi-specialty browse.
